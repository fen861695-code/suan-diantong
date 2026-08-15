// 工作台首页 - 真实工作场景
window.Pages = window.Pages || {};
window.Pages.workbench = async function(container) {
  const [tasks, market, deviation, alerts, summary, declStatus, logs] = await Promise.all([
    API.getWorkbenchTasks(), API.getWorkbenchMarketStatus(),
    API.getWorkbenchDeviation(), API.getWorkbenchAlerts(),
    API.getWorkbenchSummary(), API.getWorkbenchDeclarationStatus(),
    API.getWorkbenchLogs()
  ]);

  const urgentTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done');
  const dangerAlerts = alerts.filter(a => a.level === 'danger');

  container.innerHTML = `
    <!-- 顶部状态栏 -->
    <div class="workbench" style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:8px">
          <span class="status-dot ${market.realtimeRunning ? 'online' : ''}" style="width:10px;height:10px;border-radius:50%;background:var(--green);display:inline-block"></span>
          <span style="font-size:13px;color:var(--text-secondary)">实时市场运行中</span>
        </div>
        <div style="font-size:13px;color:var(--text-muted)">|</div>
        <div style="font-size:13px">
          当前实时电价：<span class="num" style="color:${market.currentPrice > 0.6 ? 'var(--red)' : market.currentPrice > 0.4 ? 'var(--yellow)' : 'var(--green)'};font-weight:700;font-size:16px">${market.currentPrice}</span> 元/kWh
        </div>
        <div style="font-size:13px;color:var(--text-muted)">|</div>
        <div style="font-size:13px;color:var(--text-secondary)">系统负荷：${(market.systemLoad/10000).toFixed(1)}万MW</div>
        <div style="font-size:13px;color:var(--text-secondary)">新能源占比：${market.renewableRatio}%</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:12px;color:var(--orange)">⏰ ${market.nextEvent}</span>
        <span style="background:var(--red);color:white;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600">倒计时 ${market.countdown}</span>
      </div>
    </div>

    <!-- 紧急告警 -->
    ${dangerAlerts.length > 0 ? dangerAlerts.map(a => `
      <div class="alert-banner danger" style="cursor:pointer" onclick="location.hash='#strategy'">
        <span>🚨</span>
        <span><b>${a.title}</b>：${a.content}</span>
        <span style="margin-left:auto;font-size:12px">${a.time} → 去处理</span>
      </div>
    `).join('') : ''}

    <!-- KPI行 -->
    <div class="grid grid-4" style="margin-bottom:16px">
      <div class="kpi-card" style="cursor:pointer" onclick="location.hash='#strategy'">
        <div class="kpi-label">今日电费（实时）</div>
        <div class="kpi-value" style="color:var(--accent)">¥${summary.totalCostToday}<span class="unit">万</span></div>
        <div style="font-size:11px;color:var(--green);margin-top:4px">较基准节省 ¥${summary.savingToday}万</div>
      </div>
      <div class="kpi-card" style="cursor:pointer" onclick="location.hash='#settlement'">
        <div class="kpi-label">今日偏差率</div>
        <div class="kpi-value" style="color:${Math.abs(deviation.today.deviationRate) > 2 ? 'var(--yellow)' : 'var(--green)'}">${deviation.today.deviationRate > 0 ? '+' : ''}${deviation.today.deviationRate}<span class="unit">%</span></div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">考核阈值 ±${deviation.today.penaltyThreshold}%</div>
      </div>
      <div class="kpi-card" style="cursor:pointer" onclick="location.hash='#contract'">
        <div class="kpi-label">中长期覆盖率</div>
        <div class="kpi-value" style="color:var(--accent)">${summary.positions.longTerm}<span class="unit">%</span></div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">政策底线45%</div>
      </div>
      <div class="kpi-card" style="cursor:pointer" onclick="location.hash='#green'">
        <div class="kpi-label">绿电消纳进度</div>
        <div class="kpi-value" style="color:var(--yellow)">22.5<span class="unit">%</span></div>
        <div style="font-size:11px;color:var(--red);margin-top:4px">距30%目标差7.5个百分点</div>
      </div>
    </div>

    <div class="grid grid-2" style="margin-bottom:16px">
      <!-- 今日待办 -->
      <div class="card">
        <div class="card-title" style="display:flex;justify-content:space-between;align-items:center">
          <span>📋 今日待办（${tasks.length}项）</span>
          <span style="font-size:11px;color:var(--red)">${urgentTasks.length}项紧急</span>
        </div>
        <div style="max-height:340px;overflow-y:auto">
          ${tasks.map(t => {
            const colors = { high: 'var(--red)', medium: 'var(--yellow)', low: 'var(--text-muted)' };
            const catColors = { '现货申报': 'var(--accent)', '中长期': 'var(--orange)', '绿电交易': 'var(--green)', '结算对账': 'var(--purple)', '需求响应': 'var(--yellow)', '日报': 'var(--text-muted)' };
            return `
            <div style="display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-bottom:1px solid var(--border)">
              <div style="width:3px;height:40px;background:${colors[t.priority]};border-radius:2px;flex-shrink:0;margin-top:2px"></div>
              <div style="flex:1">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                  <span style="font-size:13px;font-weight:600">${t.title}</span>
                  <span style="font-size:10px;padding:1px 6px;border-radius:8px;background:${catColors[t.category] || 'var(--accent)'}20;color:${catColors[t.category] || 'var(--accent)'}">${t.category}</span>
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">${t.description}</div>
                <div style="display:flex;align-items:center;gap:12px;font-size:11px;color:var(--text-muted)">
                  <span>👤 ${t.assignee}</span>
                  <span>⏰ 截止 ${t.deadline.split(' ')[1]}</span>
                </div>
                ${t.progress > 0 ? `<div style="margin-top:6px;height:4px;background:var(--bg-primary);border-radius:2px;overflow:hidden"><div style="height:100%;width:${t.progress}%;background:var(--accent);border-radius:2px"></div></div>` : ''}
              </div>
              <button class="action-btn ${t.id === 'T001' ? 'primary' : 'outline'}" style="padding:5px 12px;font-size:11px;flex-shrink:0" onclick="handleTask('${t.id}','${t.category}')">
                ${t.id === 'T001' ? '去申报' : t.id === 'T006' ? '生成日报' : '处理'}
              </button>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- 实时偏差监控 -->
      <div class="card">
        <div class="card-title">📊 实时偏差监控（今日）</div>
        <div class="grid grid-2" style="margin-bottom:12px">
          <div style="text-align:center;padding:12px;background:var(--bg-primary);border-radius:8px">
            <div style="font-size:11px;color:var(--text-muted)">申报电量</div>
            <div class="num" style="font-size:20px;font-weight:700;color:var(--accent)">${deviation.today.declared} <span style="font-size:12px">MWh</span></div>
          </div>
          <div style="text-align:center;padding:12px;background:var(--bg-primary);border-radius:8px">
            <div style="font-size:11px;color:var(--text-muted)">实际电量</div>
            <div class="num" style="font-size:20px;font-weight:700;color:var(--text-primary)">${deviation.today.actual} <span style="font-size:12px">MWh</span></div>
          </div>
        </div>
        <div class="alert-banner ${deviation.currentHour.status === 'warning' ? 'warning' : 'success'}" style="margin-bottom:12px">
          <span>${deviation.currentHour.status === 'warning' ? '⚠' : '✓'}</span>
          <span>当前时段（${market.currentHour}:00）：申报${deviation.currentHour.declared}MW / 实际${deviation.currentHour.actual}MW，偏差率 <b>${deviation.currentHour.deviationRate > 0 ? '+' : ''}${deviation.currentHour.deviationRate}%</b></span>
        </div>
        <div class="chart-container" id="devChart" style="height:200px"></div>
      </div>
    </div>

    <div class="grid grid-2">
      <!-- 申报进度 -->
      <div class="card">
        <div class="card-title">📝 8月16日日前申报进度</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          ${declStatus.stages.map((s, i) => {
            const color = s.done ? 'var(--green)' : s.current ? 'var(--orange)' : 'var(--text-muted)';
            return `
            <div style="text-align:center;flex:1;position:relative">
              ${i > 0 ? `<div style="position:absolute;top:14px;left:-50%;width:100%;height:2px;background:${declStatus.stages[i-1].done ? 'var(--green)' : 'var(--border)'}"></div>` : ''}
              <div style="width:28px;height:28px;border-radius:50%;background:${s.done ? 'var(--green)' : s.current ? 'var(--orange)' : 'var(--bg-primary)'};border:2px solid ${color};margin:0 auto 6px;display:flex;align-items:center;justify-content:center;font-size:12px;color:${s.done ? '#002b1a' : color};font-weight:700;position:relative;z-index:1">
                ${s.done ? '✓' : i + 1}
              </div>
              <div style="font-size:11px;color:${color};font-weight:${s.current ? '600' : '400'}">${s.label}</div>
              ${s.time ? `<div style="font-size:10px;color:var(--text-muted)">${s.time}</div>` : ''}
            </div>`;
          }).join('')}
        </div>
        <div style="display:flex;gap:8px">
          <button class="action-btn primary" style="flex:1" onclick="location.hash='#strategy'">继续申报</button>
          <button class="action-btn success" style="flex:1" id="btnApprove" onclick="approveDeclaration()">主管审核通过</button>
        </div>
        <div id="approveStatus" style="text-align:center;margin-top:8px;font-size:12px;color:var(--text-muted)"></div>
      </div>

      <!-- 操作日志 -->
      <div class="card">
        <div class="card-title" style="display:flex;justify-content:space-between;align-items:center">
          <span>📜 操作日志</span>
          <button class="action-btn outline" style="padding:3px 10px;font-size:11px" onclick="location.hash='#calendar'">查看全部</button>
        </div>
        <div style="max-height:280px;overflow-y:auto">
          ${logs.map(log => {
            const typeColors = { alert: 'var(--red)', submit: 'var(--accent)', approve: 'var(--green)', ai: 'var(--orange)', query: 'var(--text-muted)', update: 'var(--purple)' };
            const typeIcons = { alert: '🚨', submit: '📤', approve: '✅', ai: '🤖', query: '🔍', update: '📝' };
            return `
            <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
              <div style="width:24px;height:24px;border-radius:6px;background:${typeColors[log.type]}20;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">${typeIcons[log.type] || '📌'}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:12px"><b style="color:${typeColors[log.type]}">${log.user}</b> ${log.action} → ${log.target}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${log.detail}</div>
              </div>
              <div style="font-size:10px;color:var(--text-muted);flex-shrink:0">${log.time.split(' ')[1]}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- 日报生成 -->
    <div class="workbench" style="margin-top:16px;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-size:14px;font-weight:600;margin-bottom:4px">📰 交易日报</div>
        <div style="font-size:12px;color:var(--text-muted)">8月14日日报已生成，包含出清结果、偏差分析、收益归因、明日计划</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="action-btn outline" onclick="previewReport()">👁 预览</button>
        <button class="action-btn primary" onclick="generateReport()">📥 生成并发送飞书</button>
      </div>
    </div>

    <!-- 日报预览弹窗 -->
    <div id="reportModal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:2000;align-items:center;justify-content:center">
      <div style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:16px;width:680px;max-height:85vh;overflow-y:auto;padding:28px" id="reportContent"></div>
    </div>
  `;

  // 偏差监控图
  const c1 = registerChart(document.getElementById('devChart'));
  c1.setOption(baseChartOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['申报', '实际'], top: 0, textStyle: { color: '#8b9dc3', fontSize: 11 } },
    grid: { top: 30, right: 15, bottom: 25, left: 40 },
    xAxis: { type: 'category', data: deviation.hourlyData.hours.map(h => h + ':00'), axisLabel: { color: '#8b9dc3', fontSize: 9, interval: 3 } },
    yAxis: { type: 'value', name: 'MW', axisLabel: { color: '#8b9dc3', fontSize: 10 }, splitLine: { lineStyle: { color: '#1a2a5a' } } },
    series: [
      { name: '申报', type: 'line', data: deviation.hourlyData.declared, smooth: true, lineStyle: { color: '#00d4ff', width: 2 }, itemStyle: { color: '#00d4ff' }, symbol: 'none' },
      { name: '实际', type: 'line', data: deviation.hourlyData.actual, smooth: true, lineStyle: { color: '#ff6b35', width: 2 }, itemStyle: { color: '#ff6b35' }, symbol: 'none',
        areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(255,107,53,0.15)'},{offset:1,color:'rgba(255,107,53,0)'}]) }
      }
    ]
  }));

  // 任务处理
  window.handleTask = function(id, category) {
    const routes = { '现货申报': '#strategy', '中长期': '#contract', '绿电交易': '#green', '结算对账': '#settlement', '需求响应': '#dr', '日报': '' };
    if (id === 'T006') { generateReport(); return; }
    if (routes[category]) location.hash = routes[category];
  };

  // 审批
  window.approveDeclaration = function() {
    const btn = document.getElementById('btnApprove');
    btn.disabled = true;
    btn.textContent = '审核中...';
    API.approveDeclaration({}).then(() => {
      return API.feishuNotifyApproval({
        date: '8月16日',
        approver: '李华',
        time: new Date().toLocaleString('zh-CN')
      });
    }).then(() => {
      btn.textContent = '✓ 已审核并通知';
      btn.className = 'action-btn success';
      document.getElementById('approveStatus').innerHTML = '<span style="color:var(--green)">主管李华已审核通过，飞书群已收到通知</span>';
      showToast('审核通过，飞书群已通知！');
    }).catch(() => {
      btn.disabled = false;
      btn.textContent = '主管审核通过';
      showToast('操作失败，请重试');
    });
  };

  // 日报
  window.previewReport = async function() {
    const report = await API.getWorkbenchDailyReport();
    const modal = document.getElementById('reportModal');
    document.getElementById('reportContent').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h2 style="font-size:18px;margin:0">算电通 · 电力交易日报</h2>
        <button onclick="document.getElementById('reportModal').style.display='none'" style="background:none;border:none;color:var(--text-muted);font-size:18px;cursor:pointer">✕</button>
      </div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:16px">报告日期：${report.date} | 天气：${report.weather} | 编制：张明</div>

      <div style="background:var(--bg-primary);border-radius:8px;padding:16px;margin-bottom:16px">
        <div style="font-size:13px;font-weight:600;margin-bottom:10px;color:var(--accent)">一、市场行情</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;font-size:12px">
          <div>日前均价：<b>${report.dayAheadAvg}</b> 元/kWh</div>
          <div>实时均价：<b>${report.realtimeAvg}</b> 元/kWh</div>
          <div>预测准确率：<b style="color:var(--green)">${report.forecastAccuracy}%</b></div>
          <div>最高价：<b style="color:var(--red)">${report.maxPrice}</b> (${report.maxPriceHour})</div>
          <div>最低价：<b style="color:var(--green)">${report.minPrice}</b> (${report.minPriceHour})</div>
          <div>峰谷价差：<b>${(report.maxPrice - report.minPrice).toFixed(3)}</b> 元/kWh</div>
        </div>
      </div>

      <div style="background:var(--bg-primary);border-radius:8px;padding:16px;margin-bottom:16px">
        <div style="font-size:13px;font-weight:600;margin-bottom:10px;color:var(--accent)">二、交易情况</div>
        <div style="font-size:12px;line-height:2">
          总用电量：<b>${report.totalVolume} MWh</b> | 总电费：<b>¥${report.totalCost}万</b><br>
          中长期电费：¥${report.longTermCost}万 | 现货电费：¥${report.spotCost}万<br>
          偏差费用：<span style="color:${report.deviationCost <= 0 ? 'var(--green)' : 'var(--red)'}">¥${report.deviationCost}万</span>
          ${report.drRevenue > 0 ? `| 需求响应收益：<span style="color:var(--green)">+¥${report.drRevenue}万</span>` : ''}<br>
          <b style="color:var(--green)">净优化收益：+¥${report.netOptimization}万</b>
        </div>
      </div>

      <div style="background:var(--bg-primary);border-radius:8px;padding:16px;margin-bottom:16px">
        <div style="font-size:13px;font-weight:600;margin-bottom:10px;color:var(--accent)">三、今日事件</div>
        <ul style="font-size:12px;line-height:2;padding-left:16px;margin:0">
          ${report.events.map(e => `<li>${e}</li>`).join('')}
        </ul>
      </div>

      <div style="background:var(--bg-primary);border-radius:8px;padding:16px;margin-bottom:16px">
        <div style="font-size:13px;font-weight:600;margin-bottom:10px;color:var(--orange)">四、明日计划</div>
        <ul style="font-size:12px;line-height:2;padding-left:16px;margin:0">
          ${report.tomorrowPlan.map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>

      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="action-btn outline" onclick="document.getElementById('reportModal').style.display='none'">关闭</button>
        <button class="action-btn primary" onclick="sendReportToFeishu()">📤 发送飞书群</button>
      </div>
    `;
    modal.style.display = 'flex';
  };

  window.generateReport = function() {
    showToast('正在生成日报并发送飞书...');
    API.feishuNotifyReport().then(() => {
      showToast('交易日报已发送至飞书群！');
    }).catch(() => {
      showToast('发送失败，请稍后重试');
    });
  };

  window.sendReportToFeishu = function() {
    showToast('正在发送...');
    API.feishuNotifyReport().then(() => {
      document.getElementById('reportModal').style.display = 'none';
      showToast('日报已发送至飞书群！');
    }).catch(() => {
      showToast('发送失败');
    });
  };

  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
};
