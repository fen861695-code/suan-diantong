// API 客户端
const API = {
  async get(url) {
    const res = await fetch(url);
    return res.json();
  },
  async post(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  // 市场总览
  getOverview: () => API.get('/api/overview'),
  getProvinces: () => API.get('/api/provinces'),
  getPolicies: () => API.get('/api/policies'),
  // 电价
  getPriceDaily: () => API.get('/api/price/daily'),
  getPriceWeekly: () => API.get('/api/price/weekly'),
  getPriceCompare: () => API.get('/api/price/province-compare'),
  getPriceStats: () => API.get('/api/price/stats'),
  // 负荷
  getLoadStructure: () => API.get('/api/load/structure'),
  getLoadCurves: () => API.get('/api/load/curves'),
  getLoadCapacity: () => API.get('/api/load/capacity'),
  getLoadSchedule: () => API.get('/api/load/schedule'),
  // 策略
  getStrategyMix: () => API.get('/api/strategy/mix'),
  getStrategyBidding: () => API.get('/api/strategy/bidding'),
  getStrategyRevenue: () => API.get('/api/strategy/revenue'),
  // 合约
  getContractProgress: () => API.get('/api/contract/progress'),
  getContractTrend: () => API.get('/api/contract/trend'),
  getContractRecs: () => API.get('/api/contract/recommendations'),
  getContractList: () => API.get('/api/contract/list'),
  // 绿电
  getGreenCompliance: () => API.get('/api/green/compliance'),
  getGreenChannels: () => API.get('/api/green/channels'),
  getGreenHoldings: () => API.get('/api/green/holdings'),
  getGreenAdvice: () => API.get('/api/green/advice'),
  // 需求响应
  getDRCapability: () => API.get('/api/dr/capability'),
  getDRProvinces: () => API.get('/api/dr/provinces'),
  getDRHistory: () => API.get('/api/dr/history'),
  // 结算
  getSettlementSummary: () => API.get('/api/settlement/summary'),
  getSettlementComposition: () => API.get('/api/settlement/composition'),
  getSettlementDaily: () => API.get('/api/settlement/daily'),
  getSettlementDeviation: () => API.get('/api/settlement/deviation'),
  getSettlementPnl: () => API.get('/api/settlement/pnl'),
  // 日历
  getCalendarToday: () => API.get('/api/calendar/today'),
  getCalendarMonth: () => API.get('/api/calendar/month'),
  getCalendarSchedule: () => API.get('/api/calendar/schedule'),
  getCalendarLogs: () => API.get('/api/calendar/logs'),
  // 工作台
  getWorkbenchTasks: () => API.get('/api/workbench/tasks'),
  getWorkbenchMarketStatus: () => API.get('/api/workbench/market-status'),
  getWorkbenchDeviation: () => API.get('/api/workbench/deviation'),
  getWorkbenchAlerts: () => API.get('/api/workbench/alerts'),
  getWorkbenchSummary: () => API.get('/api/workbench/summary'),
  getWorkbenchDeclarationStatus: () => API.get('/api/workbench/declaration-status'),
  getWorkbenchLogs: () => API.get('/api/workbench/logs'),
  getWorkbenchDailyReport: () => API.get('/api/workbench/daily-report'),
  submitDeclaration: (data) => API.post('/api/workbench/submit-declaration', data),
  approveDeclaration: (data) => API.post('/api/workbench/approve-declaration', data),
  // 飞书推送
  feishuNotifyDeclaration: (data) => API.post('/api/feishu/notify-declaration', data),
  feishuNotifyDeviation: (data) => API.post('/api/feishu/notify-deviation', data),
  feishuNotifyReport: () => API.post('/api/feishu/notify-report', {}),
  feishuNotifyApproval: (data) => API.post('/api/feishu/notify-approval', data),
  feishuNotifyDR: (data) => API.post('/api/feishu/notify-dr', data),
  feishuNotifyGreen: (data) => API.post('/api/feishu/notify-green', data),
  feishuGetMessages: () => API.get('/api/feishu/messages'),
  feishuSend: (message) => API.post('/api/feishu/send', { message }),
  feishuSmartReply: (message) => API.post('/api/feishu/smart-reply', { message }),
  feishuNotifyPrice: (data) => API.post('/api/feishu/notify-price', data),
  feishuNotifyPolicy: (data) => API.post('/api/feishu/notify-policy', data),
  // 智能体
  agentQuery: (question) => API.post('/api/agent/query', { question })
};
