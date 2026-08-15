// 交易策略页（含申报工作台）
window.Pages.strategy = async function(container) {
  const [mix, bidding, revenue] = await Promise.all([
    API.getStrategyMix(), API.getStrategyBidding(), API.getStrategyRevenue()
  ]);

  container.innerHTML = `
    <!-- 申报工作台 -->
    <div class="workbench">
      <div class="workbench-title">日前申报工作台 <span class="tag tag-orange" style="margin-left:8px">8月16日申报</span></div>
      <div class="alert-banner info" id="aiAdvice">
        <span>🤖</span>
        <span>AI建议：10-14点光伏低谷满额申报108MW，18-20点高峰仅申报63MW刚性负荷，预计日省¥52,800</span>
        <button class="action-btn primary" style="margin-left:auto;padding:5px 14px;font-size:12px" id="btnApplyAI">采纳AI建议</button>
      </div>
      <div class="grid grid-3" style="margin-bottom:16px">
        <div>
          <div class="slider-row">
            <label>低谷段倍率</label>
            <input type="range" id="slValley" min="0" max="100" value="100" oninput="updateWorkbench()">
            <span class="slider-val" id="slValleyV">100%</span>
          </div>
          <div class="slider-row">
            <label>平段倍率</label>
            <input type="range" id="slFlat" min="0" max="100" value="50" oninput="updateWorkbench()">
            <span class="slider-val" id="slFlatV">50%</span>
          </div>
          <div class="slider-row">
            <label>高峰段倍率</label>
            <input type="range" id="slPeak" min="0" max="100" value="0" oninput="updateWorkbench()">
            <span class="slider-val" id="slPeakV">0%</span>
          </div>
        </div>
        <div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">申报概览</div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:13px;color:var(--text-secondary)">总申报电量</span>
            <span class="num" id="wbVolume" style="color:var(--accent);font-weight:600">-</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:13px;color:var(--text-secondary)">预计电费</span>
            <span class="num" id="wbCost" style="font-weight:600">-</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:13px;color:var(--text-secondary)">较基准节省</span>
            <span class="num" id="wbSave" style="color:var(--green);font-weight:600">-</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0">
            <span style="font-size:13px;color:var(--text-secondary)">度电成本</span>
            <span class="num" id="wbUnit" style="font-weight:600">-</span>
          </div>
        </div>
        <div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">操作</div>
          <button class="action-btn primary" style="width:100%;margin-bottom:8px" id="btnSubmit">
            📤 提交申报
          </button>
          <button class="action-btn outline" style="width:100%;margin-bottom:8px" id="btnReset">
            ↺ 重置
          </button>
          <div id="wbStatus" style="font-size:12px;color:var(--text-muted);text-align:center;margin-top:8px"></div>
        </div>
      </div>
      <div class="chart-container short" id="wbChart"></div>
      <div style="margin-top:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="action-btn outline" style="padding:5px 14px;font-size:12px" id="btnToggle96">
          📊 精细调整96点曲线（15分钟）
        </button>
        <button class="action-btn outline" style="padding:5px 14px;font-size:12px" id="btnCopyCurve">
          📋 复制昨日曲线
        </button>
        <span style="font-size:11px;color:var(--text-muted)">提示：96点为15分钟间隔，符合交易中心申报格式</span>
      </div>
      <div id="editor96" style="display:none;margin-top:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:12px;color:var(--text-secondary)">96点申报曲线编辑（单位：MW）</span>
          <div style="display:flex;gap:6px">
            <button class="action-btn outline" style="padding:3px 10px;font-size:11px" onclick="window._batch96('valley')">低谷全满</button>
            <button class="action-btn outline" style="padding:3px 10px;font-size:11px" onclick="window._batch96('peak')">高峰全停</button>
            <button class="action-btn outline" style="padding:3px 10px;font-size:11px" onclick="window._batch96('reset')">恢复AI方案</button>
          </div>
        </div>
        <div id="grid96" style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px;max-height:240px;overflow-y:auto;padding:8px;background:var(--bg-primary);border-radius:8px;border:1px solid var(--border)"></div>
      </div>
    </div>

    <div class="grid grid-4" id="revRow"></div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <div class="card-title">购电结构</div>
        <div class="chart-container" id="mixChart"></div>
      </div>
      <div class="card">
        <div class="card-title">收益测算</div>
        <div id="revDetail" style="padding-top:8px"></div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-title">日前申报策略（24点负荷曲线）</div>
      <div class="chart-container tall" id="biddingChart"></div>
    </div>
  `;

  // 收益卡片
  const revs = [
    { label: '峰谷套利日收益', value: '¥' + fmtMoney(revenue.arbitrageDaily), color: 'var(--green)' },
    { label: '需求响应月收益', value: '¥' + fmtMoney(revenue.drMonthly), color: 'var(--accent)' },
    { label: '综合度电成本', value: fmt(revenue.totalCostPerKwh, 3), unit: '元/kWh', color: 'var(--orange)' },
    { label: '成本下降', value: fmt(revenue.savingRate, 1), unit: '%', color: 'var(--green)' }
  ];
  document.getElementById('revRow').innerHTML = revs.map(r => `
    <div class="kpi-card">
      <div class="kpi-label">${r.label}</div>
      <div class="kpi-value" style="color:${r.color}">${r.value}${r.unit ? `<span class="unit">${r.unit}</span>` : ''}</div>
    </div>
  `).join('');

  // 购电结构饼图
  const c1 = registerChart(document.getElementById('mixChart'));
  c1.setOption({
    tooltip: { trigger: 'item', formatter: p => `${p.name}<br/>占比：${p.percent}%<br/>均价：${p.data.price} 元/kWh` },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#8b9dc3', fontSize: 12 } },
    series: [{
      type: 'pie', radius: ['45%', '72%'], center: ['38%', '50%'],
      itemStyle: { borderColor: '#0f1a3a', borderWidth: 2 },
      label: { show: false },
      data: mix.map(m => ({ name: m.name, value: m.value, price: m.price, itemStyle: { color: m.color } }))
    }]
  });

  // 收益明细
  document.getElementById('revDetail').innerHTML = `
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
      <span style="color:var(--text-secondary);font-size:13px">峰谷套利（日）</span>
      <span class="num" style="color:var(--green)">+¥${fmt(revenue.arbitrageDaily)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
      <span style="color:var(--text-secondary);font-size:13px">需求响应（月）</span>
      <span class="num" style="color:var(--green)">+¥${fmt(revenue.drMonthly)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
      <span style="color:var(--text-secondary);font-size:13px">绿电溢价成本（月）</span>
      <span class="num" style="color:var(--red)">-¥${fmt(revenue.greenCostMonthly)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
      <span style="color:var(--text-secondary);font-size:13px">优化前度电成本</span>
      <span class="num">${revenue.baselineCostPerKwh} 元/kWh</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
      <span style="color:var(--text-secondary);font-size:13px">优化后度电成本</span>
      <span class="num" style="color:var(--accent)">${revenue.totalCostPerKwh} 元/kWh</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:12px 0;margin-top:4px;background:var(--accent-dim);border-radius:8px;padding-left:12px;padding-right:12px">
      <span style="font-size:14px;font-weight:600">月度节省</span>
      <span class="num" style="color:var(--accent);font-size:18px;font-weight:700">¥${fmtMoney(revenue.monthlySaving)}</span>
    </div>
  `;

  // 申报策略堆叠图
  const c2 = registerChart(document.getElementById('biddingChart'));
  c2.setOption(baseChartOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['刚性负荷(MW)', '弹性负荷(MW)', '现货价格'], top: 0, textStyle: { color: '#8b9dc3' } },
    xAxis: { type: 'category', data: bidding.hours, axisLine: { lineStyle: { color: '#1a2a5a' } }, axisLabel: { color: '#8b9dc3' } },
    yAxis: [
      { type: 'value', name: 'MW', axisLabel: { color: '#8b9dc3' }, splitLine: { lineStyle: { color: '#1a2a5a' } } },
      { type: 'value', name: '元/kWh', axisLabel: { color: '#8b9dc3', formatter: v => v.toFixed(2) }, splitLine: { show: false } }
    ],
    series: [
      { name: '刚性负荷(MW)', type: 'bar', stack: 'total', data: bidding.rigid, itemStyle: { color: '#00d4ff' }, barWidth: '60%' },
      { name: '弹性负荷(MW)', type: 'bar', stack: 'total', data: bidding.flexible, itemStyle: { color: '#ff6b35' } },
      { name: '现货价格', type: 'line', yAxisIndex: 1, data: bidding.price, smooth: true, lineStyle: { color: '#f59e0b', width: 2 }, itemStyle: { color: '#f59e0b' }, symbol: 'none' }
    ]
  }));

  // ===== 申报工作台逻辑 =====
  const hours = bidding.hours;
  const rigid = bidding.rigid;
  const flexBase = bidding.flexible;
  const price = bidding.price;
  let wbChart = null;

  function getPeriodType(h) {
    if (h >= 10 && h <= 14) return 'valley';
    if ((h >= 17 && h <= 20) || (h >= 7 && h <= 9)) return 'peak';
    return 'flat';
  }

  window.updateWorkbench = function() {
    const vRate = document.getElementById('slValley').value / 100;
    const fRate = document.getElementById('slFlat').value / 100;
    const pRate = document.getElementById('slPeak').value / 100;
    document.getElementById('slValleyV').textContent = Math.round(vRate * 100) + '%';
    document.getElementById('slFlatV').textContent = Math.round(fRate * 100) + '%';
    document.getElementById('slPeakV').textContent = Math.round(pRate * 100) + '%';

    const adjusted = hours.map((_, i) => {
      const type = getPeriodType(i);
      const rate = type === 'valley' ? vRate : type === 'peak' ? pRate : fRate;
      return Math.round(rigid[i] + flexBase[i] * rate);
    });

    // 计算电量和电费（每小时）
    let totalMWh = 0, totalCost = 0, baselineCost = 0;
    adjusted.forEach((mw, i) => {
      totalMWh += mw;
      totalCost += mw * price[i] * 1000; // 元
      baselineCost += (rigid[i] + flexBase[i]) * price[i] * 1000;
    });

    const totalKwh = totalMWh * 1000;
    const save = baselineCost - totalCost;
    document.getElementById('wbVolume').textContent = fmt(totalMWh, 1) + ' MWh';
    document.getElementById('wbCost').textContent = '¥' + fmtMoney(totalCost);
    document.getElementById('wbSave').textContent = '¥' + fmtMoney(save);
    document.getElementById('wbSave').style.color = save >= 0 ? 'var(--green)' : 'var(--red)';
    document.getElementById('wbUnit').textContent = (totalCost / totalKwh).toFixed(3) + ' 元/kWh';

    // 更新图表
    if (!wbChart) wbChart = registerChart(document.getElementById('wbChart'));
    wbChart.setOption(baseChartOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['申报负荷', '电价'], top: 0, textStyle: { color: '#8b9dc3' } },
      xAxis: { type: 'category', data: hours, axisLabel: { color: '#8b9dc3', fontSize: 10 } },
      yAxis: [
        { type: 'value', name: 'MW', axisLabel: { color: '#8b9dc3' }, splitLine: { lineStyle: { color: '#1a2a5a' } } },
        { type: 'value', name: '元', axisLabel: { color: '#8b9dc3', formatter: v => v.toFixed(2) }, splitLine: { show: false } }
      ],
      series: [
        { name: '申报负荷', type: 'bar', data: adjusted.map((v, i) => ({
          value: v,
          itemStyle: { color: getPeriodType(i) === 'valley' ? '#10b981' : getPeriodType(i) === 'peak' ? '#ef4444' : '#00d4ff', borderRadius: [2,2,0,0] }
        })), barWidth: '60%' },
        { name: '电价', type: 'line', yAxisIndex: 1, data: price, smooth: true, lineStyle: { color: '#f59e0b', width: 2 }, itemStyle: { color: '#f59e0b' }, symbol: 'none' }
      ]
    }), true);
  };

  window.applyAI = function() {
    document.getElementById('slValley').value = 100;
    document.getElementById('slFlat').value = 50;
    document.getElementById('slPeak').value = 0;
    updateWorkbench();
    document.getElementById('wbStatus').innerHTML = '<span style="color:var(--green)">✓ 已采纳AI建议</span>';
  };

  window.resetWorkbench = function() {
    document.getElementById('slValley').value = 100;
    document.getElementById('slFlat').value = 100;
    document.getElementById('slPeak').value = 100;
    updateWorkbench();
    document.getElementById('wbStatus').textContent = '';
  };

  function submitDeclaration() {
    const btn = document.getElementById('btnSubmit');
    btn.disabled = true;
    btn.textContent = '提交中...';
    // 计算当前数据
    const vRate = document.getElementById('slValley').value / 100;
    const fRate = document.getElementById('slFlat').value / 100;
    const pRate = document.getElementById('slPeak').value / 100;
    let totalMWh = 0, totalCost = 0, baselineCost = 0;
    for (let h = 0; h < 24; h++) {
      const type = getPeriodType(h);
      const rate = type === 'valley' ? vRate : type === 'peak' ? pRate : fRate;
      const mw = rigid[h] + flexBase[h] * rate;
      totalMWh += mw;
      totalCost += mw * price[h] * 1000;
      baselineCost += (rigid[h] + flexBase[h]) * price[h] * 1000;
    }
    const save = baselineCost - totalCost;
    // 提交到后端 + 推送飞书
    API.submitDeclaration({ volume: totalMWh.toFixed(1), cost: (totalCost/10000).toFixed(1) }).then(() => {
      return API.feishuNotifyDeclaration({
        date: '8月16日',
        volume: totalMWh.toFixed(1),
        cost: (totalCost / 10000).toFixed(1),
        save: (save / 10000).toFixed(1),
        unitCost: (totalCost / (totalMWh * 1000)).toFixed(3),
        operator: '张明',
        time: new Date().toLocaleString('zh-CN')
      });
    }).then(() => {
      btn.disabled = false;
      btn.textContent = '✓ 已提交并通知飞书';
      btn.className = 'action-btn success';
      document.getElementById('wbStatus').innerHTML = '<span style="color:var(--green)">✓ 申报已提交，飞书群已收到通知卡片</span>';
      showToast('申报已提交，飞书群已通知！');
    }).catch(() => {
      btn.disabled = false;
      btn.textContent = '📤 提交申报';
      showToast('提交失败，请重试');
    });
  }

  document.getElementById('btnSubmit').addEventListener('click', submitDeclaration);
  document.getElementById('btnReset').addEventListener('click', resetWorkbench);
  document.getElementById('btnApplyAI').addEventListener('click', applyAI);

  // ===== 96点编辑器 =====
  let curve96 = [];
  function gen96FromSliders() {
    const vRate = document.getElementById('slValley').value / 100;
    const fRate = document.getElementById('slFlat').value / 100;
    const pRate = document.getElementById('slPeak').value / 100;
    curve96 = [];
    for (let h = 0; h < 24; h++) {
      const type = getPeriodType(h);
      const rate = type === 'valley' ? vRate : type === 'peak' ? pRate : fRate;
      const base = rigid[h] + flexBase[h] * rate;
      for (let q = 0; q < 4; q++) curve96.push(Math.round(base * 10) / 10);
    }
  }

  function renderGrid96() {
    const grid = document.getElementById('grid96');
    grid.innerHTML = curve96.map((v, i) => {
      const h = Math.floor(i / 4), m = (i % 4) * 15;
      const time = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
      const type = getPeriodType(h);
      const bc = type === 'valley' ? 'rgba(16,185,129,0.15)' : type === 'peak' ? 'rgba(239,68,68,0.15)' : 'rgba(0,212,255,0.08)';
      const cl = type === 'valley' ? '#10b981' : type === 'peak' ? '#ef4444' : '#00d4ff';
      return '<div style="background:' + bc + ';border:1px solid ' + cl + '40;border-radius:4px;padding:4px;text-align:center">' +
        '<div style="font-size:9px;color:var(--text-muted)">' + time + '</div>' +
        '<input type="number" value="' + v + '" step="0.5" min="0" max="120" ' +
        'style="width:100%;background:transparent;border:none;color:' + cl + ';font-size:12px;font-weight:600;text-align:center;outline:none;font-family:var(--font-mono)" ' +
        'onchange="window._edit96 && window._edit96(' + i + ', this.value)" onfocus="this.select()"></div>';
    }).join('');
  }

  window._edit96 = function(i, val) {
    curve96[i] = Math.max(0, Math.min(120, parseFloat(val) || 0));
    updateWbFrom96();
  };

  window._batch96 = function(mode) {
    if (mode === 'valley') {
      curve96 = curve96.map((v, i) => { const h = Math.floor(i/4); return getPeriodType(h) === 'valley' ? Math.round((rigid[h]+flexBase[h])*10)/10 : v; });
    } else if (mode === 'peak') {
      curve96 = curve96.map((v, i) => { const h = Math.floor(i/4); return getPeriodType(h) === 'peak' ? rigid[h] : v; });
    } else { gen96FromSliders(); }
    renderGrid96(); updateWbFrom96();
  };

  function updateWbFrom96() {
    let totalMWh = 0, totalCost = 0, baselineCost = 0;
    curve96.forEach((mw, i) => {
      const h = Math.floor(i / 4);
      totalMWh += mw / 4;
      totalCost += mw * price[h] * 250;
      baselineCost += (rigid[h] + flexBase[h]) * price[h] * 250;
    });
    const totalKwh = totalMWh * 1000;
    const save = baselineCost - totalCost;
    document.getElementById('wbVolume').textContent = fmt(totalMWh, 1) + ' MWh';
    document.getElementById('wbCost').textContent = '¥' + fmtMoney(totalCost);
    document.getElementById('wbSave').textContent = '¥' + fmtMoney(save);
    document.getElementById('wbSave').style.color = save >= 0 ? 'var(--green)' : 'var(--red)';
    document.getElementById('wbUnit').textContent = (totalCost / totalKwh).toFixed(3) + ' 元/kWh';
    const times96 = curve96.map((_, i) => { const h=Math.floor(i/4),m=(i%4)*15; return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'); });
    const prices96 = curve96.map((_, i) => price[Math.floor(i/4)]);
    if (!wbChart) wbChart = registerChart(document.getElementById('wbChart'));
    wbChart.setOption(baseChartOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['申报负荷','电价'], top: 0, textStyle: { color: '#8b9dc3' } },
      xAxis: { type: 'category', data: times96, axisLabel: { color: '#8b9dc3', fontSize: 9, interval: 7 } },
      yAxis: [
        { type: 'value', name: 'MW', axisLabel: { color: '#8b9dc3' }, splitLine: { lineStyle: { color: '#1a2a5a' } } },
        { type: 'value', name: '元', axisLabel: { color: '#8b9dc3', formatter: v => v.toFixed(2) }, splitLine: { show: false } }
      ],
      series: [
        { name: '申报负荷', type: 'bar', data: curve96.map((v, i) => { const h=Math.floor(i/4); return { value: v, itemStyle: { color: getPeriodType(h)==='valley'?'#10b981':getPeriodType(h)==='peak'?'#ef4444':'#00d4ff' } }; }), barWidth: '80%' },
        { name: '电价', type: 'line', yAxisIndex: 1, data: prices96, smooth: true, lineStyle: { color: '#f59e0b', width: 2 }, itemStyle: { color: '#f59e0b' }, symbol: 'none' }
      ]
    }), true);
  }

  document.getElementById('btnToggle96').addEventListener('click', function() {
    const editor = document.getElementById('editor96');
    if (editor.style.display === 'none') {
      gen96FromSliders(); renderGrid96(); editor.style.display = 'block';
      this.textContent = '收起96点编辑器';
    } else {
      editor.style.display = 'none'; this.textContent = '📊 精细调整96点曲线（15分钟）'; updateWorkbench();
    }
  });

  document.getElementById('btnCopyCurve').addEventListener('click', function() {
    gen96FromSliders();
    curve96 = curve96.map(v => Math.round((v + (Math.random()-0.5)*4)*10)/10);
    renderGrid96(); updateWbFrom96();
    document.getElementById('wbStatus').innerHTML = '<span style="color:var(--accent)">已复制8月15日申报曲线，请微调后提交</span>';
  });

  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  updateWorkbench();
};
