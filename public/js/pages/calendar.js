// 交易日历页
window.Pages.calendar = async function(container) {
  const [today, month, schedule, logs] = await Promise.all([
    API.getCalendarToday(), API.getCalendarMonth(), API.getCalendarSchedule(), API.getCalendarLogs()
  ]);

  container.innerHTML = `
    <div class="card">
      <div class="card-title">今日待办 - ${today.date} ${today.weekday}</div>
      <div id="todoList"></div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-title" style="justify-content:space-between">
        <span>交易月历</span>
        <div>
          <button id="prevMonth" style="background:var(--bg-primary);border:1px solid var(--border);color:var(--text-secondary);padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px">‹ 8月</button>
          <button id="nextMonth" style="background:var(--bg-primary);border:1px solid var(--border);color:var(--text-secondary);padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;margin-left:4px">9月 ›</button>
        </div>
      </div>
      <div style="display:flex;gap:16px;margin-bottom:12px;font-size:11px;color:var(--text-muted);flex-wrap:wrap">
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--red-dim);border-radius:2px;margin-right:4px"></span>政策</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--orange-dim);border-radius:2px;margin-right:4px"></span>需求响应</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--green-dim);border-radius:2px;margin-right:4px"></span>绿电交易</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--accent-dim);border-radius:2px;margin-right:4px"></span>集中竞价</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:rgba(139,92,246,0.15);border-radius:2px;margin-right:4px"></span>结算</span>
      </div>
      <div class="calendar-grid" id="calendarGrid"></div>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <div class="card-title">交易品种时间表</div>
        <table class="data-table">
          <thead><tr><th>品种</th><th>频率</th><th>申报时间</th><th>结果发布</th><th>备注</th></tr></thead>
          <tbody id="scheduleTable"></tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-title">操作日志</div>
        <div id="logList" style="max-height:400px;overflow-y:auto"></div>
      </div>
    </div>
  `;

  // 待办列表
  const priorityColors = { high: 'var(--red)', medium: 'var(--yellow)', low: 'var(--green)' };
  const priorityLabels = { high: '紧急', medium: '重要', low: '一般' };
  document.getElementById('todoList').innerHTML = today.items.map(item => `
    <div class="todo-card priority-${item.priority}">
      <div class="todo-icon" style="background:${priorityColors[item.priority]}22;color:${priorityColors[item.priority]}">
        ${item.status === 'pending' ? '⏰' : item.status === 'upcoming' ? '📅' : '✓'}
      </div>
      <div class="todo-info">
        <div class="todo-name">${item.name} <span class="tag" style="background:${priorityColors[item.priority]}22;color:${priorityColors[item.priority]};margin-left:6px">${priorityLabels[item.priority]}</span></div>
        <div class="todo-desc">${item.desc}</div>
        ${item.daysLeft !== undefined ? `<div class="todo-countdown">还有 ${item.daysLeft} 天</div>` : ''}
      </div>
      <div class="todo-time">${item.time}</div>
    </div>
  `).join('');

  // 月历渲染
  let currentMonth = 8;
  function renderCalendar(m) {
    const year = 2026;
    const firstDay = new Date(year, m - 1, 1).getDay();
    const daysInMonth = new Date(year, m, 0).getDate();
    const events = m === 8 ? month.august : month.september;
    const eventMap = {};
    events.forEach(e => { eventMap[e.day] = e.events; });

    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    let html = weekDays.map(d => `<div class="calendar-header">${d}</div>`).join('');

    // 上月填充
    const prevDays = new Date(year, m - 1, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      html += `<div class="calendar-day other-month"><div class="day-num">${prevDays - i}</div></div>`;
    }
    // 当月
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === 16 && m === 8;
      const isWeekend = new Date(year, m - 1, d).getDay() === 0 || new Date(year, m - 1, d).getDay() === 6;
      const dayEvents = eventMap[d] || [];
      html += `<div class="calendar-day ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}">
        <div class="day-num">${d}</div>
        ${dayEvents.map(e => `<div class="calendar-event event-${e.type}">${e.text}</div>`).join('')}
      </div>`;
    }
    // 下月填充
    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - totalCells % 7) % 7;
    for (let i = 1; i <= remaining; i++) {
      html += `<div class="calendar-day other-month"><div class="day-num">${i}</div></div>`;
    }
    document.getElementById('calendarGrid').innerHTML = html;
  }
  renderCalendar(8);
  document.getElementById('prevMonth').addEventListener('click', () => { currentMonth = 8; renderCalendar(8); });
  document.getElementById('nextMonth').addEventListener('click', () => { currentMonth = 9; renderCalendar(9); });

  // 交易品种表
  document.getElementById('scheduleTable').innerHTML = schedule.map(s => `
    <tr>
      <td style="font-weight:500">${s.product}</td>
      <td><span class="tag tag-blue">${s.frequency}</span></td>
      <td style="font-size:12px">${s.declareTime}</td>
      <td style="font-size:12px">${s.resultTime}</td>
      <td style="font-size:11px;color:var(--text-muted)">${s.note}</td>
    </tr>
  `).join('');

  // 操作日志
  document.getElementById('logList').innerHTML = logs.map(l => {
    const isAgent = l.operator.includes('Agent');
    const isSystem = l.operator === '系统';
    const color = isAgent ? 'var(--accent)' : isSystem ? 'var(--text-muted)' : 'var(--orange)';
    const statusColor = l.status === '已完成' || l.status === '已确认' || l.status === '已结算' || l.status === '已中标' || l.status === '已执行' ? 'var(--green)' : l.status === '处理中' ? 'var(--yellow)' : 'var(--text-muted)';
    return `
      <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="width:8px;height:8px;border-radius:50%;background:${color};margin-top:5px;flex-shrink:0"></div>
        <div style="flex:1">
          <div style="font-size:12px;color:var(--text-muted);font-family:var(--font-mono)">${l.time}</div>
          <div style="font-size:13px;margin-top:2px"><span style="color:${color};font-weight:500">${l.operator}</span> <span style="color:var(--text-secondary)">${l.action}</span></div>
        </div>
        <span class="tag" style="background:${statusColor}22;color:${statusColor};white-space:nowrap;height:fit-content">${l.status}</span>
      </div>
    `;
  }).join('');
};
