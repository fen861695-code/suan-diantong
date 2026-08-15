// ===== 路由配置 =====
const ROUTES = [
  { group: '工作台' },
  { id: 'workbench', title: '工作台', subtitle: '今日待办 · 实时监控 · 快捷操作', icon: 'home' },
  { group: '交易决策' },
  { id: 'overview', title: '市场总览', subtitle: '全国现货市场行情与政策动态', icon: 'overview' },
  { id: 'price', title: '电价分析', subtitle: '日前/实时现货价格走势与峰谷分析', icon: 'chart' },
  { id: 'load', title: '负荷与算力调度', subtitle: '数据中心负荷预测与算电协同调度', icon: 'cpu' },
  { id: 'strategy', title: '交易策略', subtitle: '购电结构与日前申报策略', icon: 'strategy' },
  { id: 'contract', title: '中长期签约', subtitle: '年度/月度合约管理与签约建议', icon: 'contract' },
  { group: '合规与收益' },
  { id: 'green', title: '绿电合规', subtitle: '42号令合规追踪与绿电采购', icon: 'leaf' },
  { id: 'dr', title: '需求响应', subtitle: '可调负荷参与辅助服务市场', icon: 'bolt' },
  { id: 'settlement', title: '结算对账', subtitle: '日清月结与盈亏归因分析', icon: 'money' },
  { group: '运营' },
  { id: 'calendar', title: '交易日历', subtitle: '交易节点提醒与操作日志', icon: 'calendar' },
  { id: 'feishu', title: '飞书联动', subtitle: '群消息同步 · 智能问答 · 通知推送', icon: 'feishu' }
];

const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  overview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>',
  strategy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>',
  contract: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  money: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  feishu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="13" cy="10" r="1" fill="currentColor"/><circle cx="17" cy="10" r="1" fill="currentColor"/></svg>'
};

// ===== 工具函数 =====
function fmt(n, d = 1) {
  if (n === null || n === undefined) return '-';
  return Number(n).toLocaleString('zh-CN', { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtWan(n) { return fmt(n / 10000, 1) + '万'; }
function fmtMoney(n) {
  if (Math.abs(n) >= 10000000) return fmt(n / 10000000, 2) + '亿';
  if (Math.abs(n) >= 10000) return fmt(n / 10000, 1) + '万';
  return fmt(n, 0);
}
function pct(n, d = 1) { return fmt(n, d) + '%'; }
function colorByPrice(p) {
  if (p >= 0.6) return '#ef4444';
  if (p >= 0.4) return '#f59e0b';
  if (p >= 0.25) return '#00d4ff';
  return '#10b981';
}

// ECharts 通用主题
const CHART_THEME = {
  textStyle: { color: '#94a3b8', fontFamily: 'Inter, sans-serif' },
  title: { textStyle: { color: '#f1f5f9', fontSize: 14, fontWeight: 600 } },
  legend: { textStyle: { color: '#94a3b8', fontSize: 11 }, itemWidth: 12, itemHeight: 8, itemGap: 16 },
  tooltip: {
    backgroundColor: 'rgba(10, 18, 35, 0.95)',
    borderColor: 'rgba(34, 211, 238, 0.3)',
    borderWidth: 1,
    textStyle: { color: '#e2e8f0', fontSize: 12 },
    padding: [10, 14],
    extraCssText: 'box-shadow: 0 8px 32px rgba(0,0,0,0.4); border-radius: 10px; backdrop-filter: blur(12px);'
  },
  grid: { top: 44, right: 20, bottom: 32, left: 56, containLabel: true },
  categoryAxis: {
    axisLine: { lineStyle: { color: 'rgba(56, 88, 140, 0.3)' } },
    axisTick: { show: false },
    axisLabel: { color: '#64748b', fontSize: 10 },
    splitLine: { show: false }
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#64748b', fontSize: 10 },
    splitLine: { lineStyle: { color: 'rgba(56, 88, 140, 0.12)', type: 'dashed' } }
  },
  colorList: ['#22d3ee', '#fb923c', '#34d399', '#a78bfa', '#f87171', '#fbbf24', '#60a5fa', '#f472b6']
};

function baseChartOption(extra = {}) {
  return {
    textStyle: CHART_THEME.textStyle,
    tooltip: { trigger: 'axis', ...CHART_THEME.tooltip },
    grid: CHART_THEME.grid,
    color: CHART_THEME.colorList,
    ...extra
  };
}

// ===== 导航渲染 =====
function renderNav() {
  const menu = document.getElementById('navMenu');
  menu.innerHTML = ROUTES.map(r => {
    if (r.group) return `<div class="nav-group-label">${r.group}</div>`;
    return `<div class="nav-item" data-page="${r.id}">${ICONS[r.icon]}<span>${r.title}</span></div>`;
  }).join('');
  menu.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.page));
  });
}

// ===== 路由 =====
let currentPage = null;
let chartInstances = [];

async function navigate(pageId) {
  // 销毁旧图表
  chartInstances.forEach(c => c.dispose());
  chartInstances = [];

  const route = ROUTES.find(r => r.id === pageId);
  if (!route) return;

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pageId);
  });
  document.getElementById('pageTitle').textContent = route.title;
  document.getElementById('pageSubtitle').textContent = route.subtitle;
  if (location.hash.slice(1) !== pageId) history.replaceState(null, '', '#' + pageId);

  const container = document.getElementById('pageContainer');
  container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 0;color:var(--text3)"><div style="width:32px;height:32px;border:3px solid rgba(34,211,238,0.15);border-top-color:var(--primary);border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:16px"></div><div style="font-size:14px">数据加载中...</div></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';

  try {
    const pageModule = window.Pages[pageId];
    if (pageModule) {
      container.innerHTML = '';
      await pageModule(container);
      // 确保DOM渲染后resize图表
      await new Promise(r => requestAnimationFrame(r));
      chartInstances.forEach(c => c.resize());
    }
  } catch (e) {
    console.error(e);
    container.innerHTML = `<div style="color:var(--red);padding:40px">页面加载失败: ${e.message}</div>`;
  }
  currentPage = pageId;
}

function registerChart(dom) {
  const chart = echarts.init(dom);
  chartInstances.push(chart);
  // 延迟一帧确保容器尺寸正确
  requestAnimationFrame(() => chart.resize());
  return chart;
}

// ===== 时钟 =====
function updateClock() {
  const now = new Date();
  const str = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0');
  document.getElementById('datetime').textContent = str;
}

// ===== 通知中心 =====
const NOTIFICATIONS = [
  { level: 'danger', title: '实时偏差接近考核阈值', desc: '20:00时段实际负荷61.2MW，申报63MW，偏差率-2.86%，接近±3%考核线', time: '20:05', unread: true, route: '#strategy' },
  { level: 'warning', title: '日前出清价格高于预期', desc: '8月16日18:00出清价0.823元/kWh，建议增加弹性负荷压减', time: '14:30', unread: true, route: '#strategy' },
  { level: 'warning', title: '绿电消纳缺口预警', desc: '当前消纳比例22.5%，距30%目标差7.5个百分点，8月18日绿电挂牌交易需补购', time: '09:15', unread: true, route: '#green' },
  { level: 'info', title: '需求响应邀约', desc: '调度机构发布8月17日削峰邀约，容量37MW，补偿2.7元/kWh', time: '08:00', unread: true, route: '#dr' },
  { level: 'success', title: '8月13日日清分单已确认', desc: '日电费87.6万元，偏差费用-0.3万元，无考核', time: '昨日 17:50', unread: false, route: '#settlement' }
];

function renderNotifications() {
  const list = document.getElementById('notifList');
  if (!list) return;
  list.innerHTML = NOTIFICATIONS.map((n, i) => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" data-route="${n.route}" data-idx="${i}">
      <div class="notif-dot ${n.level}"></div>
      <div class="notif-content">
        <div class="notif-title">${n.title}</div>
        <div class="notif-desc">${n.desc}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = +item.dataset.idx;
      NOTIFICATIONS[idx].unread = false;
      updateNotifBadge();
      document.getElementById('notifPanel').classList.remove('open');
      location.hash = item.dataset.route;
    });
  });
}

function updateNotifBadge() {
  const count = NOTIFICATIONS.filter(n => n.unread).length;
  const badge = document.getElementById('notifBadge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function initNotifications() {
  const bell = document.getElementById('notifBell');
  const panel = document.getElementById('notifPanel');
  if (!bell || !panel) return;
  renderNotifications();
  updateNotifBadge();
  bell.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !bell.contains(e.target)) {
      panel.classList.remove('open');
    }
  });
  document.getElementById('notifClear').addEventListener('click', () => {
    NOTIFICATIONS.forEach(n => n.unread = false);
    renderNotifications();
    updateNotifBadge();
  });
}

// ===== 启动 =====
async function init() {
  renderNav();
  updateClock();
  setInterval(updateClock, 1000);
  initNotifications();
  window.addEventListener('resize', () => chartInstances.forEach(c => c.resize()));
  window.addEventListener('hashchange', () => {
    const page = location.hash.slice(1) || 'workbench';
    if (ROUTES.some(r => r.id === page)) navigate(page);
  });
  const page = location.hash.slice(1) || 'workbench';
  await navigate(ROUTES.some(r => r.id === page) ? page : 'workbench');
}

document.addEventListener('DOMContentLoaded', init);
