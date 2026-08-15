// 中长期签约页
window.Pages.contract = async function(container) {
  const [progress, trend, recs, list] = await Promise.all([
    API.getContractProgress(), API.getContractTrend(), API.getContractRecs(), API.getContractList()
  ]);

  container.innerHTML = `
    <!-- 购电策略模拟器 -->
    <div class="workbench">
      <div class="workbench-title">购电策略模拟器 <span class="tag tag-blue" style="margin-left:8px">调整比例看成本</span></div>
      <div class="grid grid-3" style="margin-bottom:16px">
        <div>
          <div class="slider-row">
            <label>年度合约</label>
            <input type="range" id="simAnnual" min="0" max="100" value="55" oninput="updateSimulator()">
            <span class="slider-val" id="simAnnualV">55%</span>
          </div>
          <div class="slider-row">
            <label>月度竞价</label>
            <input type="range" id="simMonthly" min="0" max="100" value="20" oninput="updateSimulator()">
            <span class="slider-val" id="simMonthlyV">20%</span>
          </div>
          <div class="slider-row">
            <label>现货市场</label>
            <input type="range" id="simSpot" min="0" max="100" value="15" oninput="updateSimulator()">
            <span class="slider-val" id="simSpotV">15%</span>
          </div>
          <div class="slider-row">
            <label>绿电交易</label>
            <input type="range" id="simGreen" min="0" max="100" value="10" oninput="updateSimulator()">
            <span class="slider-val" id="simGreenV">10%</span>
          </div>
        </div>
        <div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">成本测算（年度）</div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:13px;color:var(--text-secondary)">年度合约电费</span>
            <span class="num" id="simAnnualCost">-</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:13px;color:var(--text-secondary)">月度竞价电费</span>
            <span class="num" id="simMonthlyCost">-</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:13px;color:var(--text-secondary)">现货购电费</span>
            <span class="num" id="simSpotCost">-</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:13px;color:var(--text-secondary)">绿电溢价</span>
            <span class="num" id="simGreenCost">-</span>
          </div>
        </div>
        <div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">结果</div>
          <div class="result-box highlight" style="text-align:center;padding:12px">
            <div style="font-size:11px;color:var(--text-muted)">年度总电费</div>
            <div class="num" id="simTotal" style="font-size:24px;font-weight:700;color:var(--accent);margin:4px 0">-</div>
            <div style="font-size:11px;color:var(--text-muted)">度电成本 <span id="simUnit" style="color:var(--text-primary)">-</span></div>
          </div>
          <div id="simWarn" style="margin-top:8px"></div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:8px">
            参考：年度合约0.372 | 月度0.410 | 现货0.388 | 绿电0.484(含溢价)
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-4" id="progRow"></div>
    <div class="card" style="margin-top:16px">
      <div class="card-title">中长期合约价 vs 现货均价（近12个月）</div>
      <div class="chart-container tall" id="trendChart"></div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-title">智能签约建议</div>
      <ul class="advice-list" id="recList"></ul>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-title">合约管理</div>
      <table class="data-table">
        <thead><tr><th>合约编号</th><th>交易对手</th><th>品种</th><th>电量(万kWh)</th><th>电价(元/kWh)</th><th>签约时间</th><th>执行月份</th><th>状态</th></tr></thead>
        <tbody id="contractTable"></tbody>
      </table>
    </div>
  `;

  // 进度卡片
  const progs = [
    { label: '年度合约', value: progress.annual, volume: progress.annualVolume, price: progress.annualPrice, color: 'var(--accent)' },
    { label: '月度合约', value: progress.monthly, volume: progress.monthlyVolume, price: progress.monthlyPrice, color: 'var(--orange)' },
    { label: '现货敞口', value: progress.spotExposure, volume: progress.spotVolume, price: null, color: 'var(--yellow)' },
    { label: '政策底线', value: progress.requirement, volume: null, price: null, color: 'var(--red)' }
  ];
  document.getElementById('progRow').innerHTML = progs.map(p => `
    <div class="kpi-card">
      <div class="kpi-label">${p.label} ${p.label === '政策底线' ? '' : `<span class="tag tag-blue">${p.value}%</span>`}</div>
      ${p.volume ? `<div class="kpi-value" style="font-size:22px;color:${p.color}">${fmt(p.volume)}<span class="unit">万kWh</span></div>` : `<div class="kpi-value" style="font-size:22px;color:${p.color}">${p.value}<span class="unit">%</span></div>`}
      ${p.price ? `<div class="kpi-change neutral">均价 ${p.price} 元/kWh</div>` : (p.label === '现货敞口' ? '<div class="kpi-change neutral">现货市场采购</div>' : '<div class="kpi-change down">最低签约比例要求</div>')}
      <div class="progress-bar"><div class="progress-fill" style="width:${p.value}%;background:${p.color}"></div></div>
    </div>
  `).join('');

  // 价格趋势图
  const c1 = registerChart(document.getElementById('trendChart'));
  c1.setOption(baseChartOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['年度合约价', '月度竞价价', '现货月均价'], top: 0, textStyle: { color: '#8b9dc3' } },
    xAxis: { type: 'category', data: trend.months, axisLine: { lineStyle: { color: '#1a2a5a' } }, axisLabel: { color: '#8b9dc3', rotate: 30 } },
    yAxis: { type: 'value', name: '元/kWh', min: 0.25, axisLabel: { color: '#8b9dc3', formatter: v => v.toFixed(2) }, splitLine: { lineStyle: { color: '#1a2a5a' } } },
    series: [
      { name: '年度合约价', type: 'line', data: trend.annualContract, lineStyle: { color: '#00d4ff', width: 2 }, itemStyle: { color: '#00d4ff' }, symbol: 'none' },
      { name: '月度竞价价', type: 'line', data: trend.monthlyBidding, smooth: true, lineStyle: { color: '#ff6b35', width: 2 }, itemStyle: { color: '#ff6b35' }, symbol: 'circle', symbolSize: 5 },
      { name: '现货月均价', type: 'line', data: trend.spotAvg, smooth: true, lineStyle: { color: '#f59e0b', width: 2 }, itemStyle: { color: '#f59e0b' }, symbol: 'circle', symbolSize: 5,
        areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(245,158,11,0.15)'},{offset:1,color:'rgba(245,158,11,0)'}]) } }
    ]
  }));

  // 建议列表
  document.getElementById('recList').innerHTML = recs.map(r =>
    `<li class="advice-${r.type}">${r.text}</li>`
  ).join('');

  // 合约表格
  document.getElementById('contractTable').innerHTML = list.map(c => `
    <tr>
      <td class="mono">${c.id}</td>
      <td>${c.party}</td>
      <td><span class="tag ${c.type.includes('绿') ? 'tag-green' : c.type.includes('年度') ? 'tag-blue' : 'tag-orange'}">${c.type}</span></td>
      <td class="num">${fmt(c.volume)}</td>
      <td class="num">${c.price !== null ? c.price.toFixed(3) : '-'}</td>
      <td style="color:var(--text-muted)">${c.signDate}</td>
      <td>${c.period}</td>
      <td><span class="tag ${c.status === '执行中' ? 'tag-green' : c.status === '待签约' ? 'tag-yellow' : 'tag-gray'}">${c.status}</span></td>
    </tr>
  `).join('');

  // ===== 策略模拟器逻辑 =====
  const annualPrice = 0.372, monthlyPrice = 0.410, spotPrice = 0.388, greenPrice = 0.484;
  const annualVolume = 613000000; // 年用电量6.13亿度

  window.updateSimulator = function() {
    let a = +document.getElementById('simAnnual').value;
    let m = +document.getElementById('simMonthly').value;
    let s = +document.getElementById('simSpot').value;
    let g = +document.getElementById('simGreen').value;
    const total = a + m + s + g;

    // 自动归一化到100%
    if (total !== 100) {
      const factor = 100 / total;
      a = Math.round(a * factor);
      m = Math.round(m * factor);
      s = Math.round(s * factor);
      g = 100 - a - m - s;
      document.getElementById('simAnnual').value = a;
      document.getElementById('simMonthly').value = m;
      document.getElementById('simSpot').value = s;
      document.getElementById('simGreen').value = g;
    }

    document.getElementById('simAnnualV').textContent = a + '%';
    document.getElementById('simMonthlyV').textContent = m + '%';
    document.getElementById('simSpotV').textContent = s + '%';
    document.getElementById('simGreenV').textContent = g + '%';

    const annualKwh = annualVolume * a / 100;
    const monthlyKwh = annualVolume * m / 100;
    const spotKwh = annualVolume * s / 100;
    const greenKwh = annualVolume * g / 100;

    const annualCost = annualKwh * annualPrice;
    const monthlyCost = monthlyKwh * monthlyPrice;
    const spotCost = spotKwh * spotPrice;
    const greenCost = greenKwh * greenPrice;
    const totalCost = annualCost + monthlyCost + spotCost + greenCost;

    document.getElementById('simAnnualCost').textContent = '¥' + fmtMoney(annualCost);
    document.getElementById('simMonthlyCost').textContent = '¥' + fmtMoney(monthlyCost);
    document.getElementById('simSpotCost').textContent = '¥' + fmtMoney(spotCost);
    document.getElementById('simGreenCost').textContent = '¥' + fmtMoney(greenCost);
    document.getElementById('simTotal').textContent = '¥' + fmtMoney(totalCost);
    document.getElementById('simUnit').textContent = (totalCost / annualVolume).toFixed(3) + ' 元/kWh';

    // 风险提示
    let warn = '';
    if (a + m < 45) warn = '<div class="alert-banner danger">⚠ 中长期签约比例' + (a+m) + '%低于政策底线45%，存在合规风险</div>';
    else if (s > 40) warn = '<div class="alert-banner warning">⚠ 现货敞口' + s + '%过大，价格波动风险高</div>';
    else if (g < 10) warn = '<div class="alert-banner warning">⚠ 绿电比例' + g + '%可能不满足42号令30%消纳目标</div>';
    else warn = '<div class="alert-banner success">✓ 签约比例合规，风险可控</div>';
    document.getElementById('simWarn').innerHTML = warn;
  };

  updateSimulator();
};
