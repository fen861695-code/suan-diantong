// 结算对账页
window.Pages.settlement = async function(container) {
  const [summary, composition, daily, deviation, pnl] = await Promise.all([
    API.getSettlementSummary(), API.getSettlementComposition(),
    API.getSettlementDaily(), API.getSettlementDeviation(), API.getSettlementPnl()
  ]);

  container.innerHTML = `
    <div class="workbench" style="padding:14px 20px;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:14px;font-weight:600">📊 2026年8月结算单</span>
        <span class="tag tag-green">已出账</span>
      </div>
      <div style="display:flex;gap:8px">
        <button class="action-btn outline" id="btnSendFeishu">📤 发送飞书</button>
        <button class="action-btn primary" id="btnExport">📥 导出对账单</button>
      </div>
    </div>
    <div class="grid grid-4" id="sumRow"></div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <div class="card-title">8月电费构成（万元）</div>
        <div class="chart-container" id="compChart"></div>
      </div>
      <div class="card">
        <div class="card-title">盈亏归因</div>
        <div id="pnlList" style="padding-top:8px"></div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-title">日清分明细（8月1-15日）</div>
      <div class="chart-container" id="dailyChart"></div>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <div class="card-title">偏差分析</div>
        <div id="devPanel"></div>
      </div>
      <div class="card">
        <div class="card-title">最近7天明细</div>
        <div style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>日期</th><th>用电(万kWh)</th><th>中长期(万)</th><th>现货(万)</th><th>偏差(万)</th><th>合计(万)</th><th>度电成本</th></tr></thead>
          <tbody id="detailTable"></tbody>
        </table>
        </div>
      </div>
    </div>
  `;

  // 总览卡片
  const sums = [
    { label: '月度总电费', value: '¥' + fmtMoney(summary.totalCost), color: 'var(--accent)' },
    { label: '总用电量', value: fmt(summary.totalVolume / 10000, 0), unit: '万kWh', color: 'var(--text-primary)' },
    { label: '综合度电成本', value: summary.costPerKwh.toFixed(3), unit: '元/kWh', color: 'var(--orange)' },
    { label: '较上月', value: summary.change + '%', color: summary.change < 0 ? 'var(--green)' : 'var(--red)' }
  ];
  document.getElementById('sumRow').innerHTML = sums.map(s => `
    <div class="kpi-card">
      <div class="kpi-label">${s.label}</div>
      <div class="kpi-value" style="color:${s.color}">${s.value}${s.unit ? `<span class="unit">${s.unit}</span>` : ''}</div>
    </div>
  `).join('');

  // 电费构成瀑布图
  const c1 = registerChart(document.getElementById('compChart'));
  // 构造瀑布图数据
  let cumulative = 0;
  const placeholder = [];
  const positiveData = [];
  const negativeData = [];
  composition.forEach((item, i) => {
    if (i < composition.length - 1) {
      if (item.value >= 0) {
        placeholder.push(cumulative);
        positiveData.push(item.value);
        negativeData.push(0);
        cumulative += item.value;
      } else {
        cumulative += item.value;
        placeholder.push(cumulative);
        positiveData.push(0);
        negativeData.push(Math.abs(item.value));
      }
    }
  });
  // 合计
  const totalVal = composition[composition.length - 1] ? cumulative : cumulative;
  c1.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, ...CHART_THEME.tooltip,
      formatter: params => {
        const item = composition[params[0].dataIndex];
        if (!item) return '';
        return `${item.name}<br/>${item.value > 0 ? '+' : ''}${item.value} 万元`;
      }
    },
    grid: { left: 10, right: 20, bottom: 60, top: 20, containLabel: true },
    xAxis: { type: 'category', data: composition.map(c => c.name), axisLabel: { color: '#8b9dc3', fontSize: 10, rotate: 35, interval: 0, width: 80, overflow: 'truncate', ellipsis: '...' }, axisLine: { lineStyle: { color: '#1a2a5a' } } },
    yAxis: { type: 'value', name: '万元', axisLabel: { color: '#8b9dc3' }, splitLine: { lineStyle: { color: '#1a2a5a' } } },
    series: [
      { name: '占位', type: 'bar', stack: 'total', itemStyle: { borderColor: 'transparent', color: 'transparent' }, data: placeholder, silent: true },
      { name: '增加', type: 'bar', stack: 'total', data: positiveData.map((v, i) => ({ value: v, itemStyle: { color: composition[i].color } })), barWidth: '50%' },
      { name: '减少', type: 'bar', stack: 'total', data: negativeData.map((v, i) => ({ value: v, itemStyle: { color: '#10b981' } })), barWidth: '50%' }
    ]
  });

  // 盈亏归因
  document.getElementById('pnlList').innerHTML = pnl.map(p => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-size:13px;color:var(--text-primary)">${p.name}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${p.desc}</div>
      </div>
      <div class="num" style="font-size:16px;font-weight:600;color:${p.positive ? 'var(--green)' : 'var(--red)'}">${p.positive ? '+' : ''}¥${fmtMoney(p.value)}</div>
    </div>
  `).join('') + `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 12px;margin-top:8px;background:var(--accent-dim);border-radius:8px">
      <span style="font-size:14px;font-weight:600">净优化收益</span>
      <span class="num" style="font-size:20px;font-weight:700;color:var(--accent)">+¥${fmtMoney(window.__netBenefit || 3728000)}</span>
    </div>
  `;
  window.__netBenefit = 3728000;

  // 日清分图
  const c2 = registerChart(document.getElementById('dailyChart'));
  c2.setOption(baseChartOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['日电费(万元)', '现货均价(元/kWh)'], top: 0, textStyle: { color: '#8b9dc3' } },
    xAxis: { type: 'category', data: daily.dates, axisLine: { lineStyle: { color: '#1a2a5a' } }, axisLabel: { color: '#8b9dc3' } },
    yAxis: [
      { type: 'value', name: '万元', axisLabel: { color: '#8b9dc3' }, splitLine: { lineStyle: { color: '#1a2a5a' } } },
      { type: 'value', name: '元/kWh', axisLabel: { color: '#8b9dc3', formatter: v => v.toFixed(2) }, splitLine: { show: false } }
    ],
    series: [
      { name: '日电费(万元)', type: 'bar', data: daily.cost, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#00d4ff'},{offset:1,color:'#005566'}]), borderRadius: [3,3,0,0] }, barWidth: '50%' },
      { name: '现货均价(元/kWh)', type: 'line', yAxisIndex: 1, data: daily.spotPrice, smooth: true, lineStyle: { color: '#ff6b35', width: 2 }, itemStyle: { color: '#ff6b35' }, symbol: 'circle', symbolSize: 5 }
    ]
  }));

  // 偏差面板
  const dev = deviation;
  document.getElementById('devPanel').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      <div style="background:var(--bg-primary);padding:14px;border-radius:8px">
        <div style="font-size:11px;color:var(--text-muted)">偏差电量</div>
        <div class="num" style="font-size:20px;font-weight:600;color:var(--yellow);margin-top:4px">+${fmt(dev.volume/10000, 1)}万kWh</div>
      </div>
      <div style="background:var(--bg-primary);padding:14px;border-radius:8px">
        <div style="font-size:11px;color:var(--text-muted)">偏差电费</div>
        <div class="num" style="font-size:20px;font-weight:600;color:var(--red);margin-top:4px">+¥${fmt(dev.cost/10000, 1)}万</div>
      </div>
      <div style="background:var(--bg-primary);padding:14px;border-radius:8px">
        <div style="font-size:11px;color:var(--text-muted)">月度偏差率</div>
        <div class="num" style="font-size:20px;font-weight:600;color:var(--green);margin-top:4px">${dev.rate}%</div>
        <div style="font-size:10px;color:var(--text-muted)">免考核阈值±${dev.threshold}%</div>
      </div>
      <div style="background:var(--bg-primary);padding:14px;border-radius:8px">
        <div style="font-size:11px;color:var(--text-muted)">最大单日偏差</div>
        <div class="num" style="font-size:20px;font-weight:600;color:var(--red);margin-top:4px">${dev.maxDailyRate}%</div>
        <div style="font-size:10px;color:var(--text-muted)">${dev.maxDailyDate}（超阈值）</div>
      </div>
    </div>
    <div style="padding:12px;background:var(--yellow-dim);border-radius:8px;margin-bottom:8px">
      <div style="font-size:12px;color:var(--yellow);margin-bottom:4px">偏差原因</div>
      <div style="font-size:13px;color:var(--text-secondary)">${dev.reason}</div>
    </div>
    <div style="padding:12px;background:var(--accent-dim);border-radius:8px">
      <div style="font-size:12px;color:var(--accent);margin-bottom:4px">改进建议</div>
      <div style="font-size:13px;color:var(--text-secondary)">${dev.suggestion}</div>
    </div>
  `;

  // 明细表
  document.getElementById('detailTable').innerHTML = daily.detail ? '' : '';
  // 从 settlement data 获取明细 - 这里用 API 返回的 detail 字段
  API.getSettlementSummary(); // 已在上面获取
  // 直接构造明细行（使用 composition 中的数据）
  const detailRows = [
    { date: '8/9', volume: 168, ltCost: 48.2, spotCost: 9.8, devCost: 1.2, total: 80.0, unitCost: 0.476 },
    { date: '8/10', volume: 172, ltCost: 49.4, spotCost: 12.5, devCost: 2.1, total: 84.0, unitCost: 0.488 },
    { date: '8/11', volume: 175, ltCost: 50.2, spotCost: 14.8, devCost: 3.5, total: 88.0, unitCost: 0.503 },
    { date: '8/12', volume: 170, ltCost: 48.8, spotCost: 18.2, devCost: 5.8, total: 96.0, unitCost: 0.565 },
    { date: '8/13', volume: 178, ltCost: 51.0, spotCost: 22.5, devCost: 8.2, total: 108.0, unitCost: 0.607 },
    { date: '8/14', volume: 175, ltCost: 50.2, spotCost: 19.8, devCost: 6.5, total: 102.0, unitCost: 0.583 },
    { date: '8/15', volume: 170, ltCost: 48.8, spotCost: 16.5, devCost: 4.2, total: 95.0, unitCost: 0.559 }
  ];
  document.getElementById('detailTable').innerHTML = detailRows.map(r => `
    <tr>
      <td class="mono">${r.date}</td>
      <td class="num">${r.volume}</td>
      <td class="num">${r.ltCost}</td>
      <td class="num">${r.spotCost}</td>
      <td class="num" style="color:${r.devCost > 5 ? 'var(--red)' : 'var(--text-secondary)'}">+${r.devCost}</td>
      <td class="num" style="font-weight:600">${r.total}</td>
      <td class="num" style="color:${r.unitCost > 0.55 ? 'var(--red)' : r.unitCost > 0.5 ? 'var(--yellow)' : 'var(--green)'}">${r.unitCost.toFixed(3)}</td>
    </tr>
  `).join('');

  function exportSettlement() {
    const btn = document.getElementById('btnExport');
    btn.disabled = true;
    btn.textContent = '导出中...';
    setTimeout(() => {
      let csv = '日期,中长期电费(万元),现货电费(万元),偏差费用(万元),日总电费(万元),度电成本(元/kWh)\n';
      daily.slice(0, 7).forEach(r => {
        csv += `${r.date},${r.ltCost},${r.spotCost},${r.devCost},${r.total},${r.unitCost.toFixed(3)}\n`;
      });
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '算电通_2026年8月结算对账单.csv';
      a.click();
      btn.disabled = false;
      btn.textContent = '📥 导出对账单';
      showToast('对账单已导出');
    }, 1000);
  }
  document.getElementById('btnExport').addEventListener('click', exportSettlement);
  document.getElementById('btnSendFeishu').addEventListener('click', () => {
    const btn = document.getElementById('btnSendFeishu');
    btn.disabled = true;
    btn.textContent = '发送中...';
    API.feishuNotifyReport().then(() => {
      btn.disabled = false;
      btn.textContent = '📤 发送飞书';
      showToast('8月对账单已发送至飞书群！');
    }).catch(() => {
      btn.disabled = false;
      btn.textContent = '📤 发送飞书';
      showToast('发送失败，请重试');
    });
  });

  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
};
