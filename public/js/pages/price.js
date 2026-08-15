// 电价分析页
window.Pages.price = async function(container) {
  const [daily, weekly, compare, stats] = await Promise.all([
    API.getPriceDaily(), API.getPriceWeekly(), API.getPriceCompare(), API.getPriceStats()
  ]);

  container.innerHTML = `
    <!-- 价格预警设置 -->
    <div class="workbench">
      <div class="workbench-title">价格预警设置 <span class="tag tag-yellow" style="margin-left:8px" id="alertCount">0条已启用</span></div>
      <div class="grid grid-3">
        <div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">高价预警（超过时提醒）</div>
          <div class="slider-row">
            <label>阈值</label>
            <input type="range" id="alertHigh" min="0.3" max="1.2" step="0.01" value="0.70" oninput="document.getElementById('alertHighV').textContent=parseFloat(this.value).toFixed(2)">
            <span class="slider-val" id="alertHighV">0.70</span>
          </div>
          <button class="action-btn ${(JSON.parse(localStorage.getItem('suan_alert_high')||'false'))?'success':'outline'}" style="width:100%;margin-top:4px" id="btnAlertHigh">
            ${(JSON.parse(localStorage.getItem('suan_alert_high')||'false'))?'✓ 已启用':'启用预警'}
          </button>
        </div>
        <div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">低价提醒（低于时提醒填谷）</div>
          <div class="slider-row">
            <label>阈值</label>
            <input type="range" id="alertLow" min="0.05" max="0.4" step="0.01" value="0.25" oninput="document.getElementById('alertLowV').textContent=parseFloat(this.value).toFixed(2)">
            <span class="slider-val" id="alertLowV">0.25</span>
          </div>
          <button class="action-btn ${(JSON.parse(localStorage.getItem('suan_alert_low')||'false'))?'success':'outline'}" style="width:100%;margin-top:4px" id="btnAlertLow">
            ${(JSON.parse(localStorage.getItem('suan_alert_low')||'false'))?'✓ 已启用':'启用提醒'}
          </button>
        </div>
        <div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">推送方式</div>
          <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
            <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-secondary);cursor:pointer">
              <input type="checkbox" id="pushFeishu" checked style="accent-color:var(--accent)"> 飞书群消息推送
            </label>
            <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-secondary);cursor:pointer">
              <input type="checkbox" id="pushBrowser" checked style="accent-color:var(--accent)"> 浏览器弹窗提醒
            </label>
            <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-secondary);cursor:pointer">
              <input type="checkbox" id="pushSound" style="accent-color:var(--accent)"> 声音提醒
            </label>
          </div>
        </div>
      </div>
      <div id="alertStatus" style="margin-top:12px"></div>
    </div>

    <div class="grid grid-4" id="statsRow"></div>
    <div class="card" style="margin-top:16px">
      <div class="card-title">广东典型日24小时日前现货价格曲线</div>
      <div class="chart-container tall" id="dailyChart"></div>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <div class="card-title">近7天日均价走势</div>
        <div class="chart-container" id="weeklyChart"></div>
      </div>
      <div class="card">
        <div class="card-title">多省峰平谷价格对比</div>
        <div class="chart-container" id="compareChart"></div>
      </div>
    </div>
  `;

  // 统计卡片
  const cards = [
    { label: '日均价', value: fmt(stats.avg, 3), unit: '元/kWh', color: 'var(--accent)' },
    { label: '最高价', value: fmt(stats.max, 3), unit: `元/kWh (${stats.maxTime})`, color: 'var(--red)' },
    { label: '最低价', value: fmt(stats.min, 3), unit: `元/kWh (${stats.minTime})`, color: 'var(--green)' },
    { label: '峰谷价差率', value: fmt(stats.spreadRate, 1), unit: '%', color: 'var(--orange)' }
  ];
  document.getElementById('statsRow').innerHTML = cards.map(c => `
    <div class="kpi-card">
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-value" style="color:${c.color}">${c.value}<span class="unit">${c.unit}</span></div>
    </div>
  `).join('');

  // 24小时价格曲线
  const c1 = registerChart(document.getElementById('dailyChart'));
  const markArea = [
    [{ name: '深夜低谷', xAxis: '00:00', itemStyle: { color: 'rgba(16,185,129,0.06)' } }, { xAxis: '06:00' }],
    [{ name: '早高峰', xAxis: '07:00', itemStyle: { color: 'rgba(245,158,11,0.06)' } }, { xAxis: '09:00' }],
    [{ name: '光伏大发', xAxis: '10:00', itemStyle: { color: 'rgba(0,212,255,0.06)' } }, { xAxis: '14:00' }],
    [{ name: '晚高峰', xAxis: '16:00', itemStyle: { color: 'rgba(239,68,68,0.08)' } }, { xAxis: '20:00' }]
  ];
  c1.setOption(baseChartOption({
    tooltip: { trigger: 'axis', ...CHART_THEME.tooltip, formatter: p => `${p[0].name}<br/>现货价格：<b style="color:${colorByPrice(p[0].value)}">${p[0].value} 元/kWh</b>` },
    xAxis: { type: 'category', data: daily.hours, boundaryGap: false, axisLine: { lineStyle: { color: '#1a2a5a' } }, axisLabel: { color: '#8b9dc3' } },
    yAxis: { type: 'value', name: '元/kWh', axisLabel: { color: '#8b9dc3', formatter: v => v.toFixed(2) }, splitLine: { lineStyle: { color: '#1a2a5a' } } },
    series: [{
      type: 'line', data: daily.price, smooth: true, symbol: 'circle', symbolSize: 6,
      lineStyle: { color: '#00d4ff', width: 2.5 },
      itemStyle: { color: '#00d4ff' },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(0,212,255,0.3)' }, { offset: 1, color: 'rgba(0,212,255,0)' }]) },
      markLine: {
        silent: true, symbol: 'none', label: { color: '#8b9dc3', fontSize: 11 },
        data: [
          { yAxis: daily.contractPrice, lineStyle: { color: '#f59e0b', type: 'dashed' }, label: { formatter: '月度合约 ' + daily.contractPrice, position: 'end' } },
          { yAxis: daily.priceCap, lineStyle: { color: '#ef4444', type: 'dotted' }, label: { formatter: '限价上限 ' + daily.priceCap, position: 'end' } }
        ]
      },
      markArea: { silent: true, data: markArea, label: { color: '#8b9dc3', fontSize: 11, position: 'top' } }
    }]
  }));

  // 7天走势
  const c2 = registerChart(document.getElementById('weeklyChart'));
  c2.setOption(baseChartOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['均价', '最高', '最低'], top: 0, textStyle: { color: '#8b9dc3' } },
    xAxis: { type: 'category', data: weekly.dates, axisLine: { lineStyle: { color: '#1a2a5a' } }, axisLabel: { color: '#8b9dc3' } },
    yAxis: { type: 'value', name: '元/kWh', axisLabel: { color: '#8b9dc3', formatter: v => v.toFixed(2) }, splitLine: { lineStyle: { color: '#1a2a5a' } } },
    series: [
      { name: '均价', type: 'bar', data: weekly.avgPrice, itemStyle: { color: 'rgba(0,212,255,0.7)', borderRadius: [3,3,0,0] }, barWidth: '40%' },
      { name: '最高', type: 'line', data: weekly.peakPrice, smooth: true, lineStyle: { color: '#ef4444' }, itemStyle: { color: '#ef4444' }, symbol: 'circle', symbolSize: 5 },
      { name: '最低', type: 'line', data: weekly.valleyPrice, smooth: true, lineStyle: { color: '#10b981' }, itemStyle: { color: '#10b981' }, symbol: 'circle', symbolSize: 5 }
    ]
  }));

  // 多省对比
  const c3 = registerChart(document.getElementById('compareChart'));
  c3.setOption(baseChartOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['峰段', '平段', '谷段'], top: 0, textStyle: { color: '#8b9dc3' } },
    xAxis: { type: 'category', data: compare.provinces, axisLine: { lineStyle: { color: '#1a2a5a' } }, axisLabel: { color: '#8b9dc3' } },
    yAxis: { type: 'value', name: '元/kWh', axisLabel: { color: '#8b9dc3', formatter: v => v.toFixed(2) }, splitLine: { lineStyle: { color: '#1a2a5a' } } },
    series: [
      { name: '峰段', type: 'bar', data: compare.peak, itemStyle: { color: '#ef4444', borderRadius: [3,3,0,0] } },
      { name: '平段', type: 'bar', data: compare.flat, itemStyle: { color: '#f59e0b', borderRadius: [3,3,0,0] } },
      { name: '谷段', type: 'bar', data: compare.valley, itemStyle: { color: '#10b981', borderRadius: [3,3,0,0] } }
    ]
  }));

  // ===== 价格预警逻辑 =====
  function updateAlertCount() {
    const h = JSON.parse(localStorage.getItem('suan_alert_high') || 'false');
    const l = JSON.parse(localStorage.getItem('suan_alert_low') || 'false');
    const count = (h ? 1 : 0) + (l ? 1 : 0);
    document.getElementById('alertCount').textContent = count + '条已启用';
    document.getElementById('alertCount').className = 'tag ' + (count > 0 ? 'tag-green' : 'tag-yellow') + '" style="margin-left:8px';
  }

  function toggleAlert(type) {
    const btn = type === 'high' ? document.getElementById('btnAlertHigh') : document.getElementById('btnAlertLow');
    const key = 'suan_alert_' + type;
    const current = JSON.parse(localStorage.getItem(key) || 'false');
    const next = !current;
    localStorage.setItem(key, next);
    if (next) {
      btn.className = 'action-btn success';
      btn.textContent = '✓ 已启用';
      const threshold = type === 'high' ?
        document.getElementById('alertHigh').value :
        document.getElementById('alertLow').value;
      const msg = type === 'high' ?
        '高价预警已启用：电价超过' + threshold + '元/kWh时将推送提醒' :
        '低价提醒已启用：电价低于' + threshold + '元/kWh时将提醒填谷';
      document.getElementById('alertStatus').innerHTML =
        '<div class="alert-banner success">✓ ' + msg + '</div>';
      showToast(msg);
    } else {
      btn.className = 'action-btn outline';
      btn.textContent = type === 'high' ? '启用预警' : '启用提醒';
      document.getElementById('alertStatus').innerHTML =
        '<div class="alert-banner info">' + (type === 'high' ? '高价预警已关闭' : '低价提醒已关闭') + '</div>';
    }
    updateAlertCount();
  }
  document.getElementById('btnAlertHigh').addEventListener('click', () => toggleAlert('high'));
  document.getElementById('btnAlertLow').addEventListener('click', () => toggleAlert('low'));

  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  // 模拟价格检测（演示用）
  const highEnabled = JSON.parse(localStorage.getItem('suan_alert_high') || 'false');
  const lowEnabled = JSON.parse(localStorage.getItem('suan_alert_low') || 'false');
  if (highEnabled && stats.max > 0.70) {
    document.getElementById('alertStatus').innerHTML =
      '<div class="alert-banner danger">⚠ 当前最高价' + stats.max + '元/kWh已超过预警阈值0.70元，建议压减弹性负荷！</div>';
  } else if (lowEnabled && stats.min < 0.25) {
    document.getElementById('alertStatus').innerHTML =
      '<div class="alert-banner success">✓ 当前最低价' + stats.min + '元/kWh低于提醒阈值0.25元，适合填谷增负荷！</div>';
  }

  updateAlertCount();
};
