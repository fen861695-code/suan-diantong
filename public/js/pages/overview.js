// 市场总览页
window.Pages = window.Pages || {};
window.Pages.overview = async function(container) {
  const [ov, provinces, policies] = await Promise.all([
    API.getOverview(), API.getProvinces(), API.getPolicies()
  ]);

  container.innerHTML = `
    <div class="grid grid-4" id="kpiRow"></div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <div class="card-title">各省现货周度均价对比（2026.8.3-8.9）</div>
        <div class="chart-container" id="provinceChart"></div>
      </div>
      <div class="card">
        <div class="card-title">各省日前价格区间</div>
        <div class="chart-container" id="rangeChart"></div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-title">政策动态</div>
      <div id="policyList"></div>
    </div>
    <div style="text-align:center;padding:16px;color:var(--text-muted);font-size:11px">
      数据来源：广东电力交易中心、北极星电力市场网、国家发改委等公开渠道 | 统计周期：2026年8月
    </div>
  `;

  // KPI 卡片
  const kpis = [
    { label: '今日日前均价', value: ov.dayAheadAvg, unit: '元/kWh', change: ov.dayAheadChange, icon: 'chart', color: 'var(--accent)' },
    { label: '峰谷价差', value: ov.spread, unit: '元/kWh', sub: `峰${ov.peakPrice} / 谷${ov.valleyPrice}`, icon: 'bolt', color: 'var(--orange)' },
    { label: '绿证价格', value: ov.greenCertPrice, unit: '元/张', change: ov.greenCertChange, icon: 'leaf', color: 'var(--green)' },
    { label: '绿电环境溢价', value: ov.greenPremium, unit: '元/kWh', sub: '8月月度均价', icon: 'money', color: 'var(--purple)' }
  ];
  document.getElementById('kpiRow').innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-icon" style="background:${k.color}22;color:${k.color}">${ICONS[k.icon] || ''}</div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${fmt(k.value, 3)}<span class="unit">${k.unit}</span></div>
      ${k.change !== undefined ? `<div class="kpi-change ${k.change > 0 ? 'up' : 'down'}">${k.change > 0 ? '↑' : '↓'} ${Math.abs(k.change)}% 较昨日</div>` : ''}
      ${k.sub ? `<div class="kpi-change neutral">${k.sub}</div>` : ''}
    </div>
  `).join('');

  // 省份均价柱状图
  const c1 = registerChart(document.getElementById('provinceChart'));
  c1.setOption(baseChartOption({
    tooltip: { trigger: 'axis', ...CHART_THEME.tooltip, formatter: p => `${p[0].name}<br/>周均价：${p[0].value} 元/kWh` },
    xAxis: { type: 'category', data: provinces.map(p => p.name), axisLine: { lineStyle: { color: '#1a2a5a' } }, axisLabel: { color: '#8b9dc3' } },
    yAxis: { type: 'value', name: '元/kWh', axisLabel: { color: '#8b9dc3', formatter: v => v.toFixed(2) }, splitLine: { lineStyle: { color: '#1a2a5a' } } },
    series: [{
      type: 'bar', data: provinces.map(p => ({
        value: p.avg,
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#00d4ff' }, { offset: 1, color: '#006688' }]), borderRadius: [4, 4, 0, 0] }
      })),
      label: { show: true, position: 'top', color: '#8b9dc3', fontSize: 11, formatter: p => p.value.toFixed(3) },
      barWidth: '50%'
    }]
  }));

  // 价格区间图
  const c2 = registerChart(document.getElementById('rangeChart'));
  c2.setOption(baseChartOption({
    tooltip: { trigger: 'axis', ...CHART_THEME.tooltip, formatter: params => {
      const p = provinces[params[0].dataIndex];
      return `${p.name}<br/>日前最高：${p.daMax}<br/>日前最低：${p.daMin}<br/>实时最高：${p.rtMax}<br/>实时最低：${p.rtMin}`;
    }},
    xAxis: { type: 'category', data: provinces.map(p => p.name), axisLine: { lineStyle: { color: '#1a2a5a' } }, axisLabel: { color: '#8b9dc3' } },
    yAxis: { type: 'value', name: '元/kWh', axisLabel: { color: '#8b9dc3', formatter: v => v.toFixed(2) }, splitLine: { lineStyle: { color: '#1a2a5a' } } },
    series: [
      { name: '日前最高', type: 'bar', data: provinces.map(p => p.daMax), itemStyle: { color: '#ef4444', borderRadius: [3,3,0,0] }, barGap: '0', barWidth: '30%' },
      { name: '日前最低', type: 'bar', data: provinces.map(p => p.daMin), itemStyle: { color: '#10b981', borderRadius: [3,3,0,0] }, barWidth: '30%' }
    ],
    legend: { data: ['日前最高', '日前最低'], top: 0, right: 10, textStyle: { color: '#8b9dc3' } }
  }));

  // 政策列表
  document.getElementById('policyList').innerHTML = policies.map(p => `
    <div style="display:flex;gap:14px;padding:14px 0;border-bottom:1px solid var(--border)">
      <span class="tag" style="background:${p.tagColor}22;color:${p.tagColor};white-space:nowrap;height:fit-content">${p.tag}</span>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:500;margin-bottom:4px">${p.title}</div>
        <div style="font-size:12px;color:var(--text-muted);line-height:1.6">${p.desc}</div>
      </div>
      <div style="font-size:11px;color:var(--text-muted);white-space:nowrap">${p.date}</div>
    </div>
  `).join('');
};
