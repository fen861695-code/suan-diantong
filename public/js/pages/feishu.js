// 飞书联动页面
window.Pages = window.Pages || {};
window.Pages.feishu = async function(container) {
  const AGENTS = [
    { key: 'policy', name: '政策研究与试点申报专员', icon: '📋', role: '政策雷达', desc: '政策跟踪、试点申报、补贴争取', color: '#a78bfa' },
    { key: 'green', name: '绿电资源开发经理', icon: '🌿', role: '资源找矿人', desc: '绿电直连、PPA谈判、项目开发', color: '#34d399' },
    { key: 'efficiency', name: '能效与液冷技术主管', icon: '❄️', role: '技术总工', desc: 'PUE优化、液冷选型、节能改造', color: '#22d3ee' },
    { key: 'trading', name: '电力市场交易专员', icon: '⚡', role: '交易操盘手', desc: '现货套利、中长期、辅助服务', color: '#fbbf24' },
    { key: 'finance', name: '资产证券化与融资经理', icon: '💼', role: '资本架构师', desc: 'REITs、绿色债券、项目贷款', color: '#f472b6' },
    { key: 'compute', name: '算力调度与AI优化工程师', icon: '🧠', role: '技术大脑', desc: '算电协同、AI制冷、需求响应', color: '#60a5fa' },
    { key: 'compliance', name: '合规与ESG认证专员', icon: '✅', role: '合规守门人', desc: '碳核算、绿证核销、ESG报告', color: '#4ade80' }
  ];

  container.innerHTML = `
      <div class="page-header">
        <h2>飞书联动</h2>
        <p>群消息同步 · 7大专业智能体协同 · 通知推送 — 与「ai数据中心团队」群实时联动</p>
      </div>

      <!-- 连接状态 -->
      <div class="card" style="margin-bottom:16px;padding:16px 20px;display:flex;align-items:center;gap:24px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:10px">
          <span class="status-dot" style="background:var(--green);box-shadow:0 0 8px var(--green)"></span>
          <span style="font-weight:600">已连接飞书群</span>
          <span style="color:var(--text2);font-size:13px">ai数据中心团队</span>
        </div>
        <div style="color:var(--text2);font-size:13px">7个专业智能体 + 1名成员</div>
        <div style="color:var(--text2);font-size:13px">最后同步: <span id="lastSync">刚刚</span></div>
        <button class="action-btn" style="margin-left:auto;padding:6px 16px;font-size:13px" onclick="feishuPage.refresh()">🔄 刷新消息</button>
      </div>

      <!-- 7大智能体 -->
      <div class="card" style="margin-bottom:16px;padding:16px 20px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <span style="font-size:18px">🤖</span>
          <span style="font-weight:600">算电协同智能体团队（7人）</span>
          <span style="font-size:12px;color:var(--text2)">点击@对应智能体提问</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px" id="agentGrid">
          ${AGENTS.map(a => `
            <div onclick="feishuPage.askAgent('${a.key}','${a.name}')" style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;cursor:pointer;transition:all 0.2s;display:flex;gap:10px;align-items:flex-start" onmouseover="this.style.borderColor='${a.color}40';this.style.background='${a.color}08'" onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--bg2)'">
              <div style="width:36px;height:36px;border-radius:8px;background:${a.color}15;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${a.icon}</div>
              <div style="min-width:0">
                <div style="font-weight:600;font-size:13px;margin-bottom:2px">@${a.name}</div>
                <div style="font-size:11px;color:${a.color};margin-bottom:4px">${a.role}</div>
                <div style="font-size:11px;color:var(--text3);line-height:1.4">${a.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 380px;gap:16px">
        <!-- 群消息流 -->
        <div class="card" style="padding:0;overflow:hidden;display:flex;flex-direction:column">
          <div style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
            <span style="font-size:18px">💬</span>
            <span style="font-weight:600">群消息</span>
            <span style="font-size:12px;color:var(--text2);background:var(--bg2);padding:2px 8px;border-radius:10px" id="msgCount">0条</span>
          </div>
          <div id="messageList" style="flex:1;overflow-y:auto;max-height:420px;padding:16px 20px">
            <div style="text-align:center;color:var(--text3);padding:40px 0">加载中...</div>
          </div>
          <div style="padding:12px 16px;border-top:1px solid var(--border);display:flex;gap:10px">
            <input type="text" id="msgInput" placeholder="输入消息发送到飞书群（可@智能体）..." style="flex:1;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 14px;color:var(--text);font-size:14px;outline:none" onkeydown="if(event.key==='Enter')feishuPage.sendMessage()">
            <button class="action-btn primary" onclick="feishuPage.sendMessage()" style="padding:10px 20px">发送</button>
          </div>
        </div>

        <!-- 右侧 -->
        <div style="display:flex;flex-direction:column;gap:16px">
          <!-- 快捷提问 -->
          <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
              <span style="font-size:18px">⚡</span>
              <span style="font-weight:600">快捷查询（机器人自动回复）</span>
            </div>
            <div style="padding:16px 20px">
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">
                <button class="tag" style="cursor:pointer;border:1px solid var(--border);background:var(--bg2)" onclick="feishuPage.ask('当前电价多少')">📊 电价</button>
                <button class="tag" style="cursor:pointer;border:1px solid var(--border);background:var(--bg2)" onclick="feishuPage.ask('申报状态')">📤 申报</button>
                <button class="tag" style="cursor:pointer;border:1px solid var(--border);background:var(--bg2)" onclick="feishuPage.ask('偏差情况')">⚠️ 偏差</button>
                <button class="tag" style="cursor:pointer;border:1px solid var(--border);background:var(--bg2)" onclick="feishuPage.ask('绿电合规')">🌿 绿电</button>
                <button class="tag" style="cursor:pointer;border:1px solid var(--border);background:var(--bg2)" onclick="feishuPage.ask('结算数据')">💰 结算</button>
                <button class="tag" style="cursor:pointer;border:1px solid var(--border);background:var(--bg2)" onclick="feishuPage.ask('需求响应')">⚡ 响应</button>
                <button class="tag" style="cursor:pointer;border:1px solid var(--border);background:var(--bg2)" onclick="feishuPage.ask('液冷PUE能效')">❄️ 能效</button>
                <button class="tag" style="cursor:pointer;border:1px solid var(--border);background:var(--bg2)" onclick="feishuPage.ask('帮助')">❓ 帮助</button>
              </div>
              <div style="display:flex;gap:8px">
                <input type="text" id="askInput" placeholder="输入问题..." style="flex:1;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:var(--text);font-size:13px;outline:none" onkeydown="if(event.key==='Enter')feishuPage.ask(this.value)">
                <button class="action-btn primary" style="padding:8px 16px;font-size:13px" onclick="feishuPage.ask(document.getElementById('askInput').value)">提问</button>
              </div>
            </div>
          </div>

          <!-- 推送记录 -->
          <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
              <span style="font-size:18px">🔔</span>
              <span style="font-weight:600">推送记录</span>
            </div>
            <div style="padding:12px 20px;max-height:180px;overflow-y:auto" id="pushLog">
              <div style="font-size:13px;color:var(--text2);text-align:center;padding:20px 0">暂无推送记录</div>
            </div>
          </div>

          <!-- 快捷推送 -->
          <div class="card" style="padding:16px 20px">
            <div style="font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:8px">⚡ 快捷推送（@对应智能体）</div>
            <div style="display:flex;flex-direction:column;gap:8px">
              <button class="action-btn" style="justify-content:flex-start;padding:10px 14px;font-size:13px" onclick="feishuPage.pushReport()">📊 推送交易日报（@交易专员）</button>
              <button class="action-btn" style="justify-content:flex-start;padding:10px 14px;font-size:13px" onclick="feishuPage.pushAlert()">⚠️ 推送偏差告警（@交易+算力）</button>
              <button class="action-btn" style="justify-content:flex-start;padding:10px 14px;font-size:13px" onclick="feishuPage.pushPrice()">📈 推送电价提醒（@交易专员）</button>
            </div>
          </div>
        </div>
      </div>
  `;

  window.feishuPage = {
    refresh() {
      const list = document.getElementById('messageList');
      if (!list) return;
      list.innerHTML = '<div style="text-align:center;color:var(--text3);padding:40px 0">加载中...</div>';
      API.feishuGetMessages().then(res => {
        const messages = res.data || [];
        const countEl = document.getElementById('msgCount');
        if (countEl) countEl.textContent = messages.length + '条';
        if (!messages.length) {
          list.innerHTML = '<div style="text-align:center;color:var(--text3);padding:40px 0">暂无消息<br><span style="font-size:12px">在下方输入框发送第一条消息</span></div>';
          return;
        }
        list.innerHTML = messages.reverse().filter(m => m.msg_type !== 'system').map(m => {
          const name = m.sender?.name || '未知';
          const time = m.create_time || '';
          let content = m.content || '';
          content = content.replace(/\s*（由豆包发送）\s*$/, '');
          content = content.replace(/<at user_id="[^"]*">([^<]*)<\/at>/g, '@$1');
          const isMe = name === '李俊宏';
          return `
            <div style="display:flex;gap:10px;margin-bottom:14px;${isMe?'flex-direction:row-reverse':''}">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--primary),#0891b2);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;color:#fff;font-weight:600">${(name[0]||'?')}</div>
              <div style="max-width:75%;${isMe?'text-align:right':''}">
                <div style="font-size:12px;color:var(--text3);margin-bottom:4px">${name} · ${time}</div>
                <div style="display:inline-block;background:${isMe?'rgba(34,211,238,0.1)':'var(--bg2)'};border:1px solid ${isMe?'rgba(34,211,238,0.2)':'var(--border)'};border-radius:10px;padding:8px 14px;font-size:13px;line-height:1.6;text-align:left;white-space:pre-wrap;word-break:break-word">${feishuPage.escapeHtml(String(content).substring(0,500))}</div>
              </div>
            </div>
          `;
        }).join('');
        list.scrollTop = list.scrollHeight;
        const ls = document.getElementById('lastSync');
        if (ls) ls.textContent = new Date().toLocaleTimeString('zh-CN');
      }).catch(() => {
        list.innerHTML = '<div style="text-align:center;color:var(--text3);padding:40px 0">消息同步暂时不可用<br><span style="font-size:12px">推送和@功能正常</span></div>';
      });
    },

    sendMessage() {
      const input = document.getElementById('msgInput');
      const msg = input.value.trim();
      if (!msg) return;
      input.value = '';
      API.feishuSend(msg).then(() => {
        showToast('消息已发送到飞书群');
        setTimeout(() => this.refresh(), 1500);
      }).catch(() => showToast('发送失败'));
    },

    ask(question) {
      if (!question || !question.trim()) return;
      const input = document.getElementById('askInput');
      if (input) input.value = question;
      showToast('机器人正在查询平台数据...');
      API.feishuSmartReply(question).then(() => {
        showToast('机器人已在飞书群回复');
        this.addPushLog('🤖 智能回复', question);
        setTimeout(() => this.refresh(), 2000);
      }).catch(() => showToast('回复失败'));
    },

    askAgent(key, name) {
      const input = document.getElementById('msgInput');
      if (input) {
        input.value = `@${name} `;
        input.focus();
      }
      showToast(`已@${name}，请输入你的问题后发送`);
    },

    pushReport() {
      API.feishuNotifyReport().then(() => {
        showToast('交易日报已推送（@交易专员）');
        this.addPushLog('📊 日报', '@电力市场交易专员');
        setTimeout(() => this.refresh(), 1500);
      }).catch(() => showToast('推送失败'));
    },

    pushAlert() {
      API.feishuNotifyDeviation({
        period: '20:00-20:15', declared: 63, actual: 61.2,
        rate: '-2.86', threshold: '3',
        suggestion: '立即压减弹性负荷2MW，避免触发考核'
      }).then(() => {
        showToast('偏差告警已推送（@交易+算力）');
        this.addPushLog('⚠️ 偏差告警', '@交易专员 @算力工程师');
        setTimeout(() => this.refresh(), 1500);
      }).catch(() => showToast('推送失败'));
    },

    pushPrice() {
      API.feishuNotifyPrice({
        type: '高价预警', price: '0.823', threshold: '0.80',
        time: '18:00', suggestion: '高峰时段压减弹性负荷至刚性63MW'
      }).then(() => {
        showToast('电价提醒已推送（@交易专员）');
        this.addPushLog('📈 电价预警', '@电力市场交易专员');
        setTimeout(() => this.refresh(), 1500);
      }).catch(() => showToast('推送失败'));
    },

    addPushLog(type, detail) {
      const log = document.getElementById('pushLog');
      if (!log) return;
      if (log.querySelector('div[style*="text-align:center"]')) log.innerHTML = '';
      const time = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'});
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px';
      item.innerHTML = `<span>${type}</span><span style="color:var(--text2);font-size:12px">${time}</span>`;
      item.title = detail;
      log.insertBefore(item, log.firstChild);
    },

    escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  feishuPage.refresh();
};
