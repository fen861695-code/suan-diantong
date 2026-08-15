// 负荷与算力调度页
window.Pages.load = async function(container) {
  const [structure, curves, capacity, schedule] = await Promise.all([
    API.getLoadStructure(), API.getLoadCurves(), API.getLoadCapacity(), API.getLoadSchedule()
  ]);

  container.innerHTML = `
    <div class="grid grid-4" id="capRow"></div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <div class="card-title">负荷结构（100MW）</div>
        <div class="chart-container" id="structureChart"></div>
      </div>
      <div class="card">
        <div class="card-title">分时段调度建议</div>
        <div id="scheduleList" style="padding-top:4px"></div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-title">24小时负荷曲线对比（原始 vs 算电协同优化）</div>
      <div class="chart-container tall" id="curveChart"></div>
    </div>
  `;

  // 容量卡片
  const caps = [
    { label: '总额定负荷', value: 100, unit: 'MW', color: 'var(--accent)' },
    { label: '最大可压减', value: capacity.maxReduction, unit: 'MW', color: 'var(--red)' },
    { label: '填谷可增负荷', value: capacity.fillIncrease, unit: 'MW', color: 'var(--green)' },
    { label: '弹性占比', value: capacity.flexibleRatio, unit: '%', color: 'var(--orange)' }
  ];
  document.getElementById('capRow').innerHTML = caps.map(c => `
    <div class="kpi-card">
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-value" style="color:${c.color}">${c.value}<span class="unit">${c.unit}</span></div>
    </div>
  `).join('');

  // 负荷结构环形图
  const c1 = registerChart(document.getElementById('structureChart'));
  c1.setOption({
    tooltip: { trigger: 'item', ...CHART_THEME.tooltip, formatter: p => `${p.name}<br/>${p.value}MW (${p.percent}%)<br/><span style="color:#8b9dc3;font-size:11px">${p.data.desc}</span>` },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#8b9dc3', fontSize: 12 } },
    series: [{
      type: 'pie', radius: ['45%', '72%'], center: ['38%', '50%'],
      itemStyle: { borderColor: '#0f1a3a', borderWidth: 2 },
      label: { show: false },
      data: structure.map(s => ({ name: s.name, value: s.value, itemStyle: { color: s.color }, desc: s.desc }))
    }]
  });

  // 调度建议
  document.getElementById('scheduleList').innerHTML = schedule.map(s => `
    <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
      <span class="tag" style="background:${s.color}22;color:${s.color};white-space:nowrap;min-width:90px;text-align:center">${s.period}</span>
      <div style="flex:1">
        <div style="font-size:13px;color:var(--text-primary)">${s.action}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px;font-family:var(--font-mono)">电价区间：${s.price} 元/kWh</div>
      </div>
    </div>
  `).join('');

  // 负荷曲线对比
  const c2 = registerChart(document.getElementById('curveChart'));
  c2.setOption(baseChartOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['原始负荷(MW)', '优化后负荷(MW)', '现货价格(元/kWh)'], top: 0, textStyle: { color: '#8b9dc3' } },
    xAxis: { type: 'category', data: curves.hours, axisLine: { lineStyle: { color: '#1a2a5a' } }, axisLabel: { color: '#8b9dc3' } },
    yAxis: [
      { type: 'value', name: 'MW', min: 50, max: 115, axisLabel: { color: '#8b9dc3' }, splitLine: { lineStyle: { color: '#1a2a5a' } } },
      { type: 'value', name: '元/kWh', axisLabel: { color: '#8b9dc3', formatter: v => v.toFixed(2) }, splitLine: { show: false } }
    ],
    series: [
      { name: '原始负荷(MW)', type: 'line', data: curves.original, smooth: true, lineStyle: { color: '#64748b', width: 2, type: 'dashed' }, itemStyle: { color: '#64748b' }, symbol: 'none' },
      { name: '优化后负荷(MW)', type: 'line', data: curves.optimized, smooth: true, lineStyle: { color: '#00d4ff', width: 2.5 }, itemStyle: { color: '#00d4ff' }, symbol: 'none',
        areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(0,212,255,0.2)'},{offset:1,color:'rgba(0,212,255,0)'}]) } },
      { name: '现货价格(元/kWh)', type: 'line', yAxisIndex: 1, data: curves.price, smooth: true, lineStyle: { color: '#ff6b35', width: 1.5 }, itemStyle: { color: '#ff6b35' }, symbol: 'none' }
    ]
  }));
};
