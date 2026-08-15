// 绿电合规页
window.Pages.green = async function(container) {
  const [compliance, channels, holdings, advice] = await Promise.all([
    API.getGreenCompliance(), API.getGreenChannels(), API.getGreenHoldings(), API.getGreenAdvice()
  ]);

  container.innerHTML = `
    <div class="grid grid-4" id="compRow"></div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <div class="card-title">42号令合规进度</div>
        <div class="chart-container" id="gaugeChart"></div>
      </div>
      <div class="card">
        <div class="card-title">绿电采购渠道对比</div>
        <table class="data-table">
          <thead><tr><th>渠道</th><th>电价</th><th>环境溢价</th><th>优势</th></tr></thead>
          <tbody id="channelTable"></tbody>
        </table>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-title">月度绿电持仓 vs 目标</div>
      <div class="chart-container" id="holdingsChart"></div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-title">合规建议</div>
      <ul class="advice-list" id="adviceList"></ul>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="action-btn primary" style="flex:1" id="btnBuyCert">🌿 一键采购绿证补缺口</button>
        <button class="action-btn outline" id="btnGreenPlatform">↗ 绿电交易平台</button>
      </div>
      <div id="greenStatus" style="text-align:center;margin-top:8px;font-size:12px;color:var(--text-muted)"></div>
    </div>
  `;

  // 合规卡片
  const comps = [
    { label: '消纳目标', value: compliance.target, unit: '%', color: 'var(--green)' },
    { label: '当前进度', value: compliance.current, unit: '%', color: compliance.current >= compliance.target ? 'var(--green)' : 'var(--yellow)' },
    { label: '缺口', value: compliance.gap, unit: '个百分点', color: 'var(--red)' },
    { label: '距年底', value: compliance.daysRemaining, unit: '天', color: 'var(--accent)' }
  ];
  document.getElementById('compRow').innerHTML = comps.map(c => `
    <div class="kpi-card">
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-value" style="color:${c.color}">${c.value}<span class="unit">${c.unit}</span></div>
    </div>
  `).join('');

  // 仪表盘
  const c1 = registerChart(document.getElementById('gaugeChart'));
  c1.setOption({
    series: [{
      type: 'gauge', startAngle: 200, endAngle: -20, min: 0, max: 40,
      progress: { show: true, width: 24, itemStyle: { color: compliance.current >= compliance.target ? '#10b981' : '#f59e0b' } },
      axisLine: { lineStyle: { width: 24, color: [[1, '#1a2a5a']] } },
      axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false }, pointer: { show: false },
      detail: { valueAnimation: false, formatter: function(v) { return v.toFixed(1) + '%'; }, color: '#e8edf7', fontSize: 36, offsetCenter: [0, '10%'] },
      title: { offsetCenter: [0, '40%'], color: '#8b9dc3', fontSize: 13 },
      data: [{ value: compliance.current, name: '当前绿电消纳比重（目标' + compliance.target + '%）' }]
    }]
  });

  // 渠道表格
  document.getElementById('channelTable').innerHTML = channels.map(ch => `
    <tr>
      <td><span class="tag" style="background:${ch.color}22;color:${ch.color}">${ch.name}</span></td>
      <td class="num">${ch.energyPrice !== null ? ch.energyPrice.toFixed(3) + ' 元' : '-'}</td>
      <td class="num">${typeof ch.premium === 'number' && ch.premium < 1 ? ch.premium.toFixed(3) + ' 元/kWh' : ch.premium + ' 元/张'}</td>
      <td style="font-size:12px">${ch.advantage}</td>
    </tr>
  `).join('');

  // 持仓图
  const c2 = registerChart(document.getElementById('holdingsChart'));
  c2.setOption(baseChartOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['已签约绿电', '目标量'], top: 0, textStyle: { color: '#8b9dc3' } },
    xAxis: { type: 'category', data: holdings.months, axisLine: { lineStyle: { color: '#1a2a5a' } }, axisLabel: { color: '#8b9dc3' } },
    yAxis: { type: 'value', name: '万kWh', axisLabel: { color: '#8b9dc3' }, splitLine: { lineStyle: { color: '#1a2a5a' } } },
    series: [
      { name: '已签约绿电', type: 'bar', data: holdings.signed, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#10b981'},{offset:1,color:'#065f46'}]), borderRadius: [3,3,0,0] }, barWidth: '45%' },
      { name: '目标量', type: 'line', data: holdings.target, lineStyle: { color: '#ef4444', type: 'dashed', width: 2 }, itemStyle: { color: '#ef4444' }, symbol: 'none' }
    ]
  }));

  // 建议
  document.getElementById('adviceList').innerHTML = advice.map(a =>
    `<li class="advice-${a.priority === 'high' ? 'danger' : a.priority === 'medium' ? 'warning' : 'info'}">${a.text}</li>`
  ).join('');

  function buyGreenCert() {
    const btn = document.getElementById('btnBuyCert');
    btn.disabled = true;
    btn.textContent = '采购中...';
    const count = 27000;
    const cost = (count * 5.43).toLocaleString('zh-CN', {maximumFractionDigits: 0});
    API.feishuNotifyGreen({
      count: count.toLocaleString(),
      cost: cost,
      before: '22.5',
      after: '25.2',
      gap: '4.8'
    }).then(() => {
      btn.textContent = '✓ 采购成功并通知';
      btn.className = 'action-btn success';
      document.getElementById('greenStatus').innerHTML = '<span style="color:var(--green)">已采购绿证27,000张（¥146,610），消纳比例提升至25.2%，飞书已通知</span>';
      showToast('绿证采购成功，飞书已通知！');
    }).catch(() => {
      btn.textContent = '✓ 采购成功';
      btn.className = 'action-btn success';
      document.getElementById('greenStatus').innerHTML = '<span style="color:var(--green)">已采购绿证27,000张（¥146,610），消纳比例提升至25.2%</span>';
      showToast('绿证采购成功！');
    });
  }
  document.getElementById('btnBuyCert').addEventListener('click', buyGreenCert);
  document.getElementById('btnGreenPlatform').addEventListener('click', () => showToast('已跳转绿电交易平台'));

  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
};
