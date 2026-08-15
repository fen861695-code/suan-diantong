// 配置文件 - 从环境变量读取敏感信息
// 复制 .env.example 为 .env 并填入实际值
const fs = require('fs');
const path = require('path');

// 简易 .env 解析器（无需 dotenv 依赖）
(function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx === -1) return;
    const key = line.substring(0, idx).trim();
    const val = line.substring(idx + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  });
})();

module.exports = {
  // 飞书群聊ID
  feishuChatId: process.env.FEISHU_CHAT_ID || '',

  // 7个专业智能体的open_id（用于@mention）
  agents: {
    policy:     { name: '政策研究与试点申报专员',  id: process.env.AGENT_POLICY_ID || '' },
    green:      { name: '绿电资源开发经理',        id: process.env.AGENT_GREEN_ID || '' },
    efficiency: { name: '能效与液冷技术主管',      id: process.env.AGENT_EFFICIENCY_ID || '' },
    trading:    { name: '电力市场交易专员',        id: process.env.AGENT_TRADING_ID || '' },
    finance:    { name: '资产证券化与融资经理',    id: process.env.AGENT_FINANCE_ID || '' },
    compute:    { name: '算力调度与AI优化工程师',  id: process.env.AGENT_COMPUTE_ID || '' },
    compliance: { name: '合规与ESG认证专员',       id: process.env.AGENT_COMPLIANCE_ID || '' }
  },

  // 服务端口
  port: parseInt(process.env.PORT, 10) || 3000
};
