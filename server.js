const express = require('express');
const path = require('path');
const config = require('./config');
const feishu = require('./services/feishu');
const app = express();
const PORT = config.port;

// 数据模块
const marketData = require('./data/market');
const priceData = require('./data/price');
const loadData = require('./data/load');
const strategyData = require('./data/strategy');
const contractData = require('./data/contract');
const greenData = require('./data/green');
const drData = require('./data/demandResponse');
const settlementData = require('./data/settlement');
const calendarData = require('./data/calendar');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API 路由
app.get('/api/overview', (req, res) => res.json(marketData.overview));
app.get('/api/provinces', (req, res) => res.json(marketData.provinces));
app.get('/api/policies', (req, res) => res.json(marketData.policies));

app.get('/api/price/daily', (req, res) => res.json(priceData.daily));
app.get('/api/price/weekly', (req, res) => res.json(priceData.weekly));
app.get('/api/price/province-compare', (req, res) => res.json(priceData.provinceCompare));
app.get('/api/price/stats', (req, res) => res.json(priceData.stats));

app.get('/api/load/structure', (req, res) => res.json(loadData.structure));
app.get('/api/load/curves', (req, res) => res.json(loadData.curves));
app.get('/api/load/capacity', (req, res) => res.json(loadData.capacity));
app.get('/api/load/schedule', (req, res) => res.json(loadData.schedule));

app.get('/api/strategy/mix', (req, res) => res.json(strategyData.mix));
app.get('/api/strategy/bidding', (req, res) => res.json(strategyData.bidding));
app.get('/api/strategy/revenue', (req, res) => res.json(strategyData.revenue));

app.get('/api/contract/progress', (req, res) => res.json(contractData.progress));
app.get('/api/contract/trend', (req, res) => res.json(contractData.trend));
app.get('/api/contract/recommendations', (req, res) => res.json(contractData.recommendations));
app.get('/api/contract/list', (req, res) => res.json(contractData.list));

app.get('/api/green/compliance', (req, res) => res.json(greenData.compliance));
app.get('/api/green/channels', (req, res) => res.json(greenData.channels));
app.get('/api/green/holdings', (req, res) => res.json(greenData.holdings));
app.get('/api/green/advice', (req, res) => res.json(greenData.advice));

app.get('/api/dr/capability', (req, res) => res.json(drData.capability));
app.get('/api/dr/provinces', (req, res) => res.json(drData.provinces));
app.get('/api/dr/history', (req, res) => res.json(drData.history));

app.get('/api/settlement/summary', (req, res) => res.json(settlementData.summary));
app.get('/api/settlement/composition', (req, res) => res.json(settlementData.composition));
app.get('/api/settlement/daily', (req, res) => res.json(settlementData.daily));
app.get('/api/settlement/deviation', (req, res) => res.json(settlementData.deviation));
app.get('/api/settlement/pnl', (req, res) => res.json(settlementData.pnl));

app.get('/api/calendar/today', (req, res) => res.json(calendarData.today));
app.get('/api/calendar/month', (req, res) => res.json(calendarData.month));
app.get('/api/calendar/schedule', (req, res) => res.json(calendarData.schedule));
app.get('/api/calendar/logs', (req, res) => res.json(calendarData.logs));

// ===== 工作台 =====
const workbenchData = require('./data/workbench');
app.get('/api/workbench/tasks', (req, res) => res.json(workbenchData.tasks));
app.get('/api/workbench/market-status', (req, res) => res.json(workbenchData.marketStatus));
app.get('/api/workbench/deviation', (req, res) => res.json(workbenchData.deviation));
app.get('/api/workbench/alerts', (req, res) => res.json(workbenchData.alerts));
app.get('/api/workbench/summary', (req, res) => res.json(workbenchData.todaySummary));
app.get('/api/workbench/declaration-status', (req, res) => res.json(workbenchData.declarationStatus));
app.get('/api/workbench/logs', (req, res) => res.json(workbenchData.operationLogs));
app.get('/api/workbench/daily-report', (req, res) => res.json(workbenchData.dailyReport));

// 申报提交（模拟）
app.post('/api/workbench/submit-declaration', express.json(), (req, res) => {
  res.json({ success: true, message: '申报已提交', submitTime: new Date().toLocaleString('zh-CN'), tradeId: 'SD' + Date.now() });
});
// 审批通过（模拟）
app.post('/api/workbench/approve-declaration', express.json(), (req, res) => {
  res.json({ success: true, message: '审核通过', approveTime: new Date().toLocaleString('zh-CN') });
});

// ===== 飞书推送 =====
// 申报提交通知
app.post('/api/feishu/notify-declaration', express.json(), async (req, res) => {
  try {
    const result = await feishu.notifyDeclaration(req.body);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 偏差告警
app.post('/api/feishu/notify-deviation', express.json(), async (req, res) => {
  try {
    const result = await feishu.notifyDeviation(req.body);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 日报推送
app.post('/api/feishu/notify-report', express.json(), async (req, res) => {
  try {
    const report = workbenchData.dailyReport;
    const result = await feishu.notifyDailyReport(report);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 审批通知
app.post('/api/feishu/notify-approval', express.json(), async (req, res) => {
  try {
    const result = await feishu.notifyApproval(req.body);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 需求响应通知
app.post('/api/feishu/notify-dr', express.json(), async (req, res) => {
  try {
    const result = await feishu.notifyDR(req.body);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 绿证采购通知
app.post('/api/feishu/notify-green', express.json(), async (req, res) => {
  try {
    const result = await feishu.notifyGreen(req.body);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 价格预警（@交易专员）
app.post('/api/feishu/notify-price', express.json(), async (req, res) => {
  try {
    const result = await feishu.notifyPriceAlert(req.body);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 政策更新（@政策专员+合规专员）
app.post('/api/feishu/notify-policy', express.json(), async (req, res) => {
  try {
    const result = await feishu.notifyPolicyUpdate(req.body);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 读取飞书群消息
app.get('/api/feishu/messages', async (req, res) => {
  try {
    const messages = await feishu.getMessages(20);
    res.json({ success: true, data: messages });
  } catch (e) {
    // 超时或失败时返回空列表，不阻塞页面
    res.json({ success: true, data: [], notice: '消息同步暂时不可用，推送功能正常' });
  }
});

// 从平台发送消息到飞书群
app.post('/api/feishu/send', express.json(), async (req, res) => {
  try {
    const result = await feishu.sendMarkdown(req.body.message || req.body.text || '');
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 智能回复（模拟@机器人）
app.post('/api/feishu/smart-reply', express.json(), async (req, res) => {
  try {
    await feishu.smartReply(req.body.message || '');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 智能体查询接口
app.post('/api/agent/query', (req, res) => {
  const { question } = req.body;
  const answer = calendarData.agentQuery(question);
  res.json({ answer });
});

app.listen(PORT, () => {
  console.log(`算电通平台已启动: http://localhost:${PORT}`);
});
