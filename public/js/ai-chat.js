// AI交易助手聊天窗
(function() {
  const fab = document.getElementById('aiFab');
  const panel = document.getElementById('aiPanel');
  const close = document.getElementById('aiClose');
  const messages = document.getElementById('aiMessages');
  const input = document.getElementById('aiInput');
  const send = document.getElementById('aiSend');
  const quickBtns = document.querySelectorAll('.ai-quick-btn');

  let opened = false;

  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (!opened) {
      opened = true;
      addBotMessage('您好！我是AI交易助手，可以帮您：<br>• 查询电价和市场行情<br>• 制定日前申报策略<br>• 分析绿电合规情况<br>• 测算需求响应收益<br>• 解读结算账单<br><br>请问有什么可以帮您？');
    }
  });
  close.addEventListener('click', () => panel.classList.remove('open'));

  function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'ai-msg user';
    div.innerHTML = `<div class="ai-msg-avatar">我</div><div class="ai-msg-bubble">${text}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function addBotMessage(html) {
    const div = document.createElement('div');
    div.className = 'ai-msg bot';
    div.innerHTML = `<div class="ai-msg-avatar">AI</div><div class="ai-msg-bubble">${html}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function addTyping() {
    const div = document.createElement('div');
    div.className = 'ai-msg bot';
    div.id = 'aiTyping';
    div.innerHTML = `<div class="ai-msg-avatar">AI</div><div class="ai-msg-bubble"><div class="ai-typing"><span></span><span></span><span></span></div></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById('aiTyping');
    if (t) t.remove();
  }

  // 智能回答（基于平台真实数据）
  function getAnswer(q) {
    q = q.toLowerCase();
    if (q.includes('申报') || q.includes('明天') || q.includes('日前')) {
      return '根据明日电价预测，建议申报策略如下：<br><br>' +
        '<b>低谷时段 10:00-14:00</b>（预测0.20-0.31元）：<br>满额申报弹性负荷至 <b>108MW</b>，安排全部训练任务<br><br>' +
        '<b>高峰时段 18:00-20:00</b>（预测0.65-0.82元）：<br>仅申报刚性负荷 <b>62-63MW</b>，暂停训练<br><br>' +
        '<b>平段</b>：申报50%弹性负荷<br><br>' +
        '<span class="success">预计日度电费节省约5.3万元</span><br><br>' +
        '请前往"交易策略"页面查看详细曲线，可在"申报工作台"微调后提交。';
    }
    if (q.includes('绿电') || q.includes('合规') || q.includes('缺口') || q.includes('42号')) {
      return '当前绿电合规情况：<br><br>' +
        '• 消纳目标：<b>30%</b>（42号令要求）<br>' +
        '• 当前进度：<b>22.5%</b><br>' +
        '• 缺口：<span class="alert">7.5个百分点</span><br>' +
        '• 距年底：138天<br><br>' +
        '<b>补缺口建议：</b><br>' +
        '1. 8月18日绿电挂牌交易补购（紧急）<br>' +
        '2. 采购绿证约2.7万张，约14.7万元<br>' +
        '3. 9月起绿电签约比例提至15%<br><br>' +
        '请前往"绿电合规"页面查看详情。';
    }
    if (q.includes('电价') || q.includes('价格') || q.includes('多少钱')) {
      return '今日广东现货市场行情：<br><br>' +
        '• 日前均价：<b>0.388元/kWh</b>（较昨日-2.3%）<br>' +
        '• 最高：<span class="alert">0.823元</span>（18:00晚高峰）<br>' +
        '• 最低：<span class="success">0.200元</span>（12:00光伏大发）<br>' +
        '• 峰谷价差：<b>0.623元/kWh</b><br>' +
        '• 月度合约价：0.410元/kWh<br><br>' +
        '<b>套利窗口：</b>10:00-14:00低价时段适合安排训练任务，18:00-20:00建议压减负荷。';
    }
    if (q.includes('需求响应') || q.includes('削峰') || q.includes('补贴') || q.includes('赚')) {
      return '需求响应收益测算：<br><br>' +
        '• 可申报容量：<b>37MW</b><br>' +
        '• 响应速度：5分钟<br>' +
        '• 广东削峰补偿：<b>2.7元/kWh</b><br><br>' +
        '<b>单次收益（37MW×2h×2.7元）：</b><br><span class="success">¥199,800</span><br><br>' +
        '<b>月度预估</b>（4次）：¥799,200<br>' +
        '<b>年度预估</b>（30次）：¥5,994,000<br><br>' +
        '今年已参与5次，累计收益62.0万元。请前往"需求响应"页面使用计算器。';
    }
    if (q.includes('结算') || q.includes('电费') || q.includes('账单') || q.includes('花了')) {
      return '8月结算概况：<br><br>' +
        '• 月度总电费：<b>¥2,678万</b><br>' +
        '• 总用电量：5,108万kWh<br>' +
        '• 度电成本：<b>0.524元/kWh</b>（较7月-3.2%）<br><br>' +
        '<b>优化收益：</b><br>' +
        '• 中长期对冲：+340万<br>' +
        '• 峰谷套利：+52.8万<br>' +
        '• 需求响应：+40万<br>' +
        '• 偏差损失：-36万<br>' +
        '• <span class="success">净优化收益：+372.8万</span><br><br>' +
        '请前往"结算对账"页面查看明细。';
    }
    if (q.includes('负荷') || q.includes('算力') || q.includes('调度') || q.includes('训练')) {
      return '数据中心负荷情况：<br><br>' +
        '• 总额定：100MW<br>' +
        '• 刚性负荷（在线推理）：45MW<br>' +
        '• 弹性负荷（训练）：30MW<br>' +
        '• 最大可压减：<b>37MW</b><br>' +
        '• 填谷可增：18MW<br><br>' +
        '<b>调度建议：</b><br>' +
        '10:00-14:00 光伏低谷→训练满负荷<br>' +
        '18:00-20:00 晚高峰→仅保留刚性<br><br>' +
        '请前往"负荷与算力调度"页面查看曲线。';
    }
    if (q.includes('合约') || q.includes('签约') || q.includes('中长期')) {
      return '中长期合约情况：<br><br>' +
        '• 年度合约：55%（均价0.372元）<br>' +
        '• 月度竞价：20%（均价0.410元）<br>' +
        '• 现货敞口：25%<br>' +
        '• 签约率：<span class="success">75%</span>（政策底线45%）<br><br>' +
        '<b>提醒：</b>9月月度集中竞价将于8月20日开展，建议签约1.22亿kWh。<br><br>' +
        '请前往"中长期签约"页面查看合约明细和策略建议。';
    }
    if (q.includes('你好') || q.includes('hi') || q.includes('hello')) {
      return '您好！我是算电通AI交易助手。我可以帮您查询电价、制定申报策略、分析绿电合规、测算需求响应收益等。请问今天想了解什么？';
    }
    return '我可以帮您查询以下信息：<br><br>' +
      '📊 <b>电价行情</b> - "今天电价多少"<br>' +
      '📝 <b>申报策略</b> - "明天怎么申报"<br>' +
      '🌿 <b>绿电合规</b> - "绿电缺口多少"<br>' +
      '⚡ <b>需求响应</b> - "能赚多少"<br>' +
      '💰 <b>结算账单</b> - "8月电费多少"<br>' +
      '🔋 <b>负荷调度</b> - "训练任务怎么排"<br><br>' +
      '请点击下方快捷按钮或直接输入问题。';
  }

  async function ask(question) {
    addUserMessage(question);
    addTyping();
    // 模拟思考延迟
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    removeTyping();
    addBotMessage(getAnswer(question));
  }

  send.addEventListener('click', () => {
    const text = input.value.trim();
    if (text) { ask(text); input.value = ''; }
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') send.click();
  });
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => ask(btn.dataset.q));
  });
})();
