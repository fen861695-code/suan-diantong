// 飞书推送服务
const { execFileSync, execFile } = require('child_process');
const config = require('../config');

const CHAT_ID = config.feishuChatId;

// 本地消息日志（lark-cli读消息不稳定时作为兜底）
const localMessages = [];
function addLocalMsg(sender, content, msgType) {
  const now = new Date();
  const time = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
  localMessages.unshift({
    msg_type: msgType || 'text',
    content: String(content).replace(/<at user_id="[^"]*">([^<]*)<\/at>/g, '@$1'),
    sender: { name: sender },
    create_time: time
  });
  if (localMessages.length > 50) localMessages.length = 50;
}

// 7个专业智能体的open_id（从环境变量读取，用于@mention）
const AGENTS = config.agents;

function runLark(args) {
  return execFileSync('lark-cli', args, {
    encoding: 'utf8', timeout: 20000, maxBuffer: 1024 * 1024
  });
}

function sendMarkdown(md) {
  const plainText = md.replace(/[#*_`~]/g, '').replace(/\n+/g, '\n');
  addLocalMsg('李俊宏', plainText, 'text');
  // 异步发送到飞书，不阻塞平台
  try {
    execFile('lark-cli', ['im', '+messages-send', '--chat-id', CHAT_ID, '--markdown', md],
      { encoding: 'utf8', timeout: 18000, maxBuffer: 1024 * 1024 }, () => {});
  } catch (e) {}
  return Promise.resolve({ ok: true, local: true });
}

function sendText(text) {
  addLocalMsg('李俊宏', text, 'text');
  try {
    execFile('lark-cli', ['im', '+messages-send', '--chat-id', CHAT_ID, '--text', text],
      { encoding: 'utf8', timeout: 18000, maxBuffer: 1024 * 1024 }, () => {});
  } catch (e) {}
  return Promise.resolve({ ok: true, local: true });
}

// @一个或多个智能体
function at(agentKeys) {
  return agentKeys.map(k => {
    const a = AGENTS[k];
    return a ? `<at user_id="${a.id}">${a.name}</at>` : '';
  }).join(' ');
}

// 发送带@的文本消息
function sendTextWithAt(text, agentKeys) {
  const mention = at(agentKeys);
  return sendText(`${mention} ${text}`);
}

function getMessages(count) {
  return new Promise((resolve) => {
    // 先返回本地消息（即时显示）
    const local = localMessages.slice(0, count);
    // 异步尝试lark-cli，成功则合并
    execFile('lark-cli',
      ['im', '+chat-messages-list', '--chat-id', CHAT_ID, '--page-size', String(count || 20)],
      { encoding: 'utf8', timeout: 6000, maxBuffer: 1024 * 1024 },
      (error, stdout) => {
        if (error) { resolve(local); return; }
        try {
          const result = JSON.parse(stdout);
          const remote = result.data?.messages || [];
          // 合并：远程消息+本地消息，按时间去重
          const seen = new Set();
          const merged = [];
          [...remote, ...local].forEach(m => {
            const key = (m.create_time || '') + (m.content || '').substring(0, 20);
            if (!seen.has(key)) { seen.add(key); merged.push(m); }
          });
          merged.sort((a, b) => (b.create_time || '').localeCompare(a.create_time || ''));
          resolve(merged.slice(0, count));
        } catch (e) { resolve(local); }
      }
    );
    // 6秒超时后如果还没返回，先返回本地
    setTimeout(() => resolve(local), 6500);
  });
}

// ===== 消息模板（带@智能体） =====

function notifyDeclaration(data) {
  return sendMarkdown(
    `## 📤 日前申报已提交\n\n` +
    `**申报日期：** ${data.date}\n\n` +
    `**总申报电量：** ${data.volume} MWh\n\n` +
    `**预计电费：** ¥${data.cost}万\n\n` +
    `**预计节省：** ¥${data.save}万\n\n` +
    `**度电成本：** ${data.unitCost} 元/kWh\n\n` +
    `**提交人：** ${data.operator}\n\n` +
    `**提交时间：** ${data.time}\n\n` +
    `---\n*算电通 · 等待14:00出清结果，请${AGENTS.trading.name}关注出清行情*`
  );
}

function notifyDeviation(data) {
  return sendTextWithAt(
    `⚠️ 偏差接近考核阈值！\n` +
    `时段：${data.period}\n` +
    `申报：${data.declared}MW / 实际：${data.actual}MW\n` +
    `偏差率：${data.rate}%（阈值±${data.threshold}%）\n` +
    `建议：${data.suggestion}\n` +
    `请立即处理！`,
    ['trading', 'compute']
  );
}

function notifyDailyReport(data) {
  const drLine = data.drRevenue > 0 ? `**需求响应：** +¥${data.drRevenue}万\n\n` : '';
  return sendMarkdown(
    `## 📊 交易日报 · ${data.date}\n\n` +
    `**市场行情**\n\n` +
    `日前均价：${data.dayAheadAvg} 元/kWh | 实时均价：${data.realtimeAvg} 元/kWh\n\n` +
    `最高：${data.maxPrice} 元 (${data.maxPriceHour}) | 最低：${data.minPrice} 元 (${data.minPriceHour})\n\n` +
    `**交易情况**\n\n` +
    `总用电量：${data.totalVolume} MWh | 总电费：¥${data.totalCost}万\n\n` +
    `中长期：¥${data.longTermCost}万 | 现货：¥${data.spotCost}万\n\n` +
    `偏差费用：${data.deviationCost >= 0 ? '+' : ''}¥${data.deviationCost}万\n\n` +
    drLine +
    `**净优化收益：+¥${data.netOptimization}万**\n\n` +
    `**明日计划**\n\n` +
    data.tomorrowPlan.map(p => `• ${p}`).join('\n\n') +
    `\n\n---\n*算电通 · 请${AGENTS.trading.name}复盘，${AGENTS.compute.name}确认明日调度计划*`
  );
}

function notifyApproval(data) {
  return sendMarkdown(
    `## ✅ 申报审批通过\n\n` +
    `**申报日期：** ${data.date}\n\n` +
    `**审核人：** ${data.approver}\n\n` +
    `**审核时间：** ${data.time}\n\n` +
    `**状态：** 已提交交易中心，等待出清\n\n` +
    `---\n*算电通 · ${AGENTS.trading.name}请关注出清结果*`
  );
}

function notifyDR(data) {
  return sendTextWithAt(
    `⚡ 需求响应报名确认\n` +
    `响应日期：${data.date}\n` +
    `响应容量：${data.capacity}MW\n` +
    `响应时长：${data.duration}小时\n` +
    `补偿价格：${data.price}元/kWh\n` +
    `预计收益：¥${data.revenue}\n` +
    `状态：${data.status}\n` +
    `请提前做好负荷调整准备。`,
    ['trading', 'compute', 'efficiency']
  );
}

function notifyGreen(data) {
  return sendTextWithAt(
    `🌿 绿证采购确认\n` +
    `采购数量：${data.count}张\n` +
    `采购金额：¥${data.cost}\n` +
    `消纳比例：${data.before}% → ${data.after}%\n` +
    `距30%目标：还差${data.gap}个百分点\n` +
    `请跟进绿证核销和合规台账更新。`,
    ['green', 'compliance']
  );
}

// 价格预警 → @交易专员
function notifyPriceAlert(data) {
  return sendTextWithAt(
    `📈 电价预警\n` +
    `类型：${data.type}\n` +
    `当前价格：${data.price}元/kWh\n` +
    `阈值：${data.threshold}元/kWh\n` +
    `时间：${data.time}\n` +
    `建议：${data.suggestion}`,
    ['trading']
  );
}

// 政策更新 → @政策专员
function notifyPolicyUpdate(data) {
  return sendTextWithAt(
    `📋 政策动态提醒\n` +
    `标题：${data.title}\n` +
    `发布机构：${data.agency}\n` +
    `日期：${data.date}\n` +
    `要点：${data.summary}\n` +
    `请解读影响并更新合规要求。`,
    ['policy', 'compliance']
  );
}

function smartReply(message) {
  const msg = String(message).toLowerCase();
  addLocalMsg('李俊宏', message, 'text');
  let reply = '';

  if (msg.includes('电价') || msg.includes('价格') || msg.includes('多少钱')) {
    reply = '📊 **当前电价信息**\n\n' +
      '日前均价：0.388 元/kWh\n' +
      '峰时最高：0.823 元/kWh（18:00）\n' +
      '谷时最低：0.200 元/kWh（12:00）\n' +
      '峰谷价差：0.623 元/kWh\n' +
      '实时电价：0.612 元/kWh\n\n' +
      `建议：低谷时段（10-14点）满负荷运行，高峰时段（17-21点）压减弹性负荷。\n\n` +
      `如需专业分析，请@${AGENTS.trading.name}`;
  } else if (msg.includes('申报')) {
    reply = '📤 **8月16日前申报状态**\n\n' +
      '状态：审核中\n' +
      '总申报电量：1,822 MWh\n' +
      '预计电费：¥67.1万\n' +
      '预计节省：¥5.3万\n' +
      '度电成本：0.368 元/kWh\n' +
      '申报截止：今日12:00\n' +
      '出清时间：今日14:00\n\n' +
      `如需调整策略，请@${AGENTS.trading.name}`;
  } else if (msg.includes('偏差') || msg.includes('考核')) {
    reply = '⚠️ **实时偏差监控**\n\n' +
      '当前时段：20:00-20:15\n' +
      '申报负荷：63 MW\n' +
      '实际负荷：61.2 MW\n' +
      '偏差率：-2.86%（接近±3%考核线）\n' +
      '今日偏差率：-1.33%\n\n' +
      `建议：立即调整弹性负荷，避免偏差考核费用。\n\n` +
      `如需调度方案，请@${AGENTS.compute.name} 或 @${AGENTS.trading.name}`;
  } else if (msg.includes('绿电') || msg.includes('绿证') || msg.includes('合规')) {
    reply = '🌿 **绿电合规状态**\n\n' +
      '当前消纳比例：22.5%\n' +
      '政策目标：30%（42号令要求）\n' +
      '缺口：7.5个百分点\n' +
      '绿证价格：5.43 元/张\n' +
      '绿电环境溢价：0.046 元/kWh\n\n' +
      `建议：补购绿证2.7万张，消纳比例可提升至25.2%。\n\n` +
      `如需绿电采购方案，请@${AGENTS.green.name}；合规问题请@${AGENTS.compliance.name}`;
  } else if (msg.includes('结算') || msg.includes('对账') || msg.includes('电费')) {
    reply = '💰 **8月结算概览**\n\n' +
      '总电费：¥2,678万\n' +
      '总用电量：5,108万kWh\n' +
      '综合度电成本：0.524 元/kWh\n' +
      '中长期合约电费：¥1,450万\n' +
      '日前现货电费：¥1,680万\n' +
      '实时偏差费：-¥36万\n' +
      '需求响应收益：+¥40万\n' +
      '净优化收益：+¥372.8万\n\n' +
      `如需融资方案，请@${AGENTS.finance.name}`;
  } else if (msg.includes('需求响应') || msg.includes('响应')) {
    reply = '⚡ **需求响应**\n\n' +
      '当前邀约：8月17日削峰\n' +
      '响应容量：37 MW/2h\n' +
      '补偿价格：2.7 元/kWh\n' +
      '预计收益：¥19.98万\n' +
      '报名截止：今日12:00\n\n' +
      '本月已参与2次削峰+1次填谷，累计收益¥21.6万。\n\n' +
      `如需执行方案，请@${AGENTS.compute.name} 或 @${AGENTS.efficiency.name}`;
  } else if (msg.includes('负荷') || msg.includes('用电')) {
    reply = '🔌 **负荷情况**\n\n' +
      '当前总负荷：98 MW\n' +
      '刚性负荷：45 MW（不可调）\n' +
      '弹性负荷：30 MW（可时移）\n' +
      '批处理任务：10 MW（可调度）\n' +
      '制冷系统：12 MW（可调）\n' +
      '辅助系统：3 MW\n' +
      '新能源占比：28.5%\n\n' +
      `如需调度优化，请@${AGENTS.compute.name}`;
  } else if (msg.includes('日报') || msg.includes('今日') || msg.includes('行情')) {
    reply = '📊 **今日市场行情**\n\n' +
      '日前均价：0.388 元/kWh（↓0.012）\n' +
      '实时均价：0.415 元/kWh（↑0.027）\n' +
      '系统负荷：9.8万MW\n' +
      '新能源占比：28.5%\n\n' +
      '今日已节省：¥5.3万\n' +
      '本月累计优化收益：¥372.8万';
  } else if (msg.includes('政策')) {
    reply = `📋 **近期重点政策**\n\n` +
      '• 42号令（2026.8.1施行）：数据中心绿电消纳权重目标30%\n' +
      '• 34号文：算电协同，支持数据中心参与电力市场\n' +
      '• 73号文：AI+能源电子协同创新\n' +
      '• 650/688号文：绿电直连政策落地\n\n' +
      `如需详细解读，请@${AGENTS.policy.name}`;
  } else if (msg.includes('融资') || msg.includes('reits') || msg.includes('REITs')) {
    reply = '💼 **资本运作**\n\n' +
      '行业参考：世纪互联三单REITs合计72亿元\n' +
      'Pre-REITs目标：ROIC从5-8%提升至10-15%\n' +
      '绿色债券：G-1认证框架\n\n' +
      `如需融资方案，请@${AGENTS.finance.name}`;
  } else if (msg.includes('液冷') || msg.includes('pue') || msg.includes('PUE') || msg.includes('能效')) {
    reply = '❄️ **能效状态**\n\n' +
      '当前PUE：1.32\n' +
      '政策目标：1.25以下\n' +
      '液冷覆盖率：35%\n' +
      'AI制冷优化节能率：18%\n\n' +
      `如需技术方案，请@${AGENTS.efficiency.name}`;
  } else if (msg.includes('帮助') || msg.includes('help') || msg.includes('能做什么')) {
    reply = '🤖 **算电通智能助手**\n\n' +
      '我可以帮你查询平台数据，也可以@专业智能体：\n\n' +
      `• @${AGENTS.policy.name} — 政策解读、试点申报\n` +
      `• @${AGENTS.green.name} — 绿电资源、PPA谈判\n` +
      `• @${AGENTS.efficiency.name} — PUE、液冷、节能改造\n` +
      `• @${AGENTS.trading.name} — 电力交易、申报策略\n` +
      `• @${AGENTS.finance.name} — REITs、绿色债券、融资\n` +
      `• @${AGENTS.compute.name} — 算力调度、AI优化\n` +
      `• @${AGENTS.compliance.name} — 碳核算、ESG、认证\n\n` +
      '直接问我：电价、申报、偏差、绿电、结算、需求响应、负荷、日报、政策';
  } else {
    reply = '收到你的消息。输入「帮助」查看我能查询的数据，或直接@对应的专业智能体：\n\n' +
      Object.values(AGENTS).map(a => `• @${a.name}`).join('\n');
  }
  addLocalMsg('算电通助手', reply.replace(/[#*_`~]/g, '').replace(/\n+/g, '\n'), 'text');
  try {
    execFile('lark-cli', ['im', '+messages-send', '--chat-id', CHAT_ID, '--markdown', reply],
      { encoding: 'utf8', timeout: 18000, maxBuffer: 1024 * 1024 }, () => {});
  } catch (e) {}
  return Promise.resolve({ ok: true, local: true });
}

module.exports = {
  sendText, sendMarkdown, getMessages, smartReply,
  notifyDeclaration, notifyDeviation, notifyDailyReport,
  notifyApproval, notifyDR, notifyGreen,
  notifyPriceAlert, notifyPolicyUpdate,
  AGENTS
};
