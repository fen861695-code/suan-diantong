// 需求响应页
window.Pages.dr = async function(container) {
  const [cap, provinces, history] = await Promise.all([
    API.getDRCapability(), API.getDRProvinces(), API.getDRHistory()
  ]);

  container.innerHTML = `
    <div class="grid grid-4" id="capRow"></div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <div class="card-title">收益计算器</div>
        <div class="calc-row">
          <label>响应容量 <span id="capVal">37 MW</span></label>
          <input type="range" id="capSlider" min="5" max="50" value="37" step="1">
        </div>
        <div class="calc-row">
          <label>响应时长 <span id="durVal">2 小时</span></label>
          <input type="range" id="durSlider" min="0.5" max="4" value="2" step="0.5">
        </div>
        <div class="calc-row">
          <label>响应价格 <span id="priceVal">2.7 元/kWh</span></label>
          <input type="range" id="priceSlider" min="0.5" max="9" value="2.7" step="0.1">
        </div>
        <div class="calc-result">
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">单次响应收益</div>
          <div class="amount" id="singleRev">¥199,800</div>
          <div style="display:flex;justify-content:space-around;margin-top:12px;font-size:12px;color:var(--text-secondary)">
            <div>月度预估(4次)<br/><span class="num" id="monthRev" style="color:var(--accent)">¥799,200</span></div>
            <div>年度预估(30次)<br/><span class="num" id="yearRev" style="color:var(--accent)">¥5,994,000</span></div>
          </div>
          <button class="action-btn primary" style="width:100%;margin-top:14px" id="btnJoinDR">📋 报名参与本次需求响应</button>
          <div id="drStatus" style="text-align:center;margin-top:8px;font-size:12px;color:var(--text-muted)"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">各省补偿标准对比</div>
        <div class="chart-container" id="provChart"></div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-title">响应历史记录</div>
      <table class="data-table">
        <thead><tr><th>日期</th><th>类型</th><th>时段</th><th>响应容量(MW)</th><th>出清价格(元/kWh)</th><th>实际收益</th><th>状态</th></tr></thead>
        <tbody id="historyTable"></tbody>
      </table>
    </div>
  `;

  // 能力卡片
  const caps = [
    { label: '可申报容量', value: cap.capacity, unit: 'MW', color: 'var(--accent)' },
    { label: '响应速度', value: cap.speed, unit: '', color: 'var(--green)' },
    { label: '可持续时长', value: cap.duration, unit: '', color: 'var(--orange)' },
    { label: '年度累计收益', value: fmtMoney(history.reduce((s,h) => s + h.revenue, 0)), unit: '', color: 'var(--green)' }
  ];
  document.getElementById('capRow').innerHTML = caps.map(c => `
    <div class="kpi-card">
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-value" style="color:${c.color};font-size:${typeof c.value === 'number' ? '28px' : '22px'}">${c.value}${c.unit ? `<span class="unit">${c.unit}</span>` : ''}</div>
    </div>
  `).join('');

  // 计算器
  function calc() {
    const c = +document.getElementById('capSlider').value;
    const d = +document.getElementById('durSlider').value;
    const p = +document.getElementById('priceSlider').value;
    document.getElementById('capVal').textContent = c + ' MW';
    document.getElementById('durVal').textContent = d + ' 小时';
    document.getElementById('priceVal').textContent = p.toFixed(1) + ' 元/kWh';
    const single = c * 1000 * d * p;
    document.getElementById('singleRev').textContent = '¥' + fmt(single, 0);
    document.getElementById('monthRev').textContent = '¥' + fmt(single * 4, 0);
    document.getElementById('yearRev').textContent = '¥' + fmt(single * 30, 0);
  }
  ['capSlider','durSlider','priceSlider'].forEach(id => document.getElementById(id).addEventListener('input', calc));

  function joinDR() {
    const btn = document.getElementById('btnJoinDR');
    btn.disabled = true;
    btn.textContent = '报名中...';
    const cap = document.getElementById('capSlider').value;
    const dur = document.getElementById('durSlider').value;
    const price = document.getElementById('priceSlider').value;
    const revenue = cap * 1000 * dur * price;
    API.feishuNotifyDR({
      date: '8月17日',
      capacity: cap,
      duration: dur,
      price: price,
      revenue: revenue.toLocaleString('zh-CN', {maximumFractionDigits: 0}),
      status: '已报名，等待调度确认'
    }).then(() => {
      btn.textContent = '✓ 已报名并通知';
      btn.className = 'action-btn success';
      btn.disabled = false;
      document.getElementById('drStatus').innerHTML = '<span style="color:var(--green)">报名成功！飞书群已收到通知，响应日将推送调度指令</span>';
      showToast('需求响应报名成功，飞书已通知！');
    }).catch(() => {
      btn.textContent = '✓ 已报名';
      btn.className = 'action-btn success';
      btn.disabled = false;
      document.getElementById('drStatus').innerHTML = '<span style="color:var(--green)">报名成功！</span>';
      showToast('报名成功（飞书通知发送失败）');
    });
  }
  document.getElementById('btnJoinDR').addEventListener('click', joinDR);

  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  // 省份对比图
  const c1 = registerChart(document.getElementById('provChart'));
  c1.setOption(baseChartOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['削峰补偿', '填谷补偿'], top: 0, textStyle: { color: '#8b9dc3' } },
    xAxis: { type: 'category', data: provinces.map(p => p.province), axisLine: { lineStyle: { color: '#1a2a5a' } }, axisLabel: { color: '#8b9dc3' } },
    yAxis: { type: 'value', name: '元/kWh', axisLabel: { color: '#8b9dc3' }, splitLine: { lineStyle: { color: '#1a2a5a' } } },
    series: [
      { name: '削峰补偿', type: 'bar', data: provinces.map(p => p.peakComp), itemStyle: { color: '#ef4444', borderRadius: [3,3,0,0] }, barWidth: '35%' },
      { name: '填谷补偿', type: 'bar', data: provinces.map(p => p.valleyComp || 0), itemStyle: { color: '#10b981', borderRadius: [3,3,0,0] }, barWidth: '35%' }
    ]
  }));

  // 历史表格
  document.getElementById('historyTable').innerHTML = history.map(h => `
    <tr>
      <td class="mono">${h.date}</td>
      <td><span class="tag ${h.type === '削峰' ? 'tag-red' : 'tag-green'}">${h.type}</span></td>
      <td>${h.period}</td>
      <td class="num">${h.capacity}</td>
      <td class="num">${h.price.toFixed(3)}</td>
      <td class="num" style="color:var(--green)">¥${fmt(h.revenue)}</td>
      <td><span class="tag tag-green">已结算</span></td>
    </tr>
  `).join('');
};
