// 中长期签约数据
module.exports = {
  progress: {
    requirement: 45,       // 政策要求最低比例%
    annual: 55,
    monthly: 20,
    spotExposure: 25,
    annualVolume: 33700,   // 万kWh
    annualPrice: 0.372,
    monthlyVolume: 12200,
    monthlyPrice: 0.410,
    spotVolume: 15300,
    totalVolume: 61300,    // 年预计用电量 万kWh
    status: '达标'
  },
  // 近12个月价格对比
  trend: {
    months: ['2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08'],
    annualContract: [0.372,0.372,0.372,0.372,0.372,0.372,0.372,0.372,0.372,0.372,0.372,0.372],
    monthlyBidding: [0.398,0.405,0.412,0.388,0.365,0.378,0.395,0.402,0.408,0.415,0.410,0.410],
    spotAvg: [0.425,0.448,0.465,0.398,0.325,0.310,0.335,0.368,0.395,0.420,0.435,0.388]
  },
  recommendations: [
    { type: 'success', text: '当前中长期签约比例75%，高于45%政策底线，合约覆盖充足，现货敞口风险可控。' },
    { type: 'info', text: '8月现货均价0.388元/kWh，与年度合约价0.372元接近，中长期对冲效果中性，建议维持当前比例。' },
    { type: 'warning', text: '9月月度集中竞价将于8月20日开展，参考8月竞价结果0.410元/kWh，建议签约1.22亿kWh（20%比例）。' },
    { type: 'warning', text: '若9月现货均价预测0.42元/kWh（迎峰度夏尾声），建议增加月度签约至25%，将现货敞口降至20%。' },
    { type: 'success', text: '年度合约锁定0.372元低价，在7月现货0.435元时发挥对冲作用，单月节省约340万元。' }
  ],
  list: [
    { id: 'ND-2026-001', party: '华能汕头电厂', type: '年度双边', volume: 12000, price: 0.365, signDate: '2025-12-15', period: '1-12月', status: '执行中' },
    { id: 'ND-2026-002', party: '大唐潮州电厂', type: '年度双边', volume: 10500, price: 0.372, signDate: '2025-12-18', period: '1-12月', status: '执行中' },
    { id: 'ND-2026-003', party: '国家能源集团', type: '年度双边', volume: 11200, price: 0.378, signDate: '2025-12-20', period: '1-12月', status: '执行中' },
    { id: 'YD-2026-08', party: '集中竞价', type: '月度竞价', volume: 12200, price: 0.410, signDate: '2026-07-25', period: '8月', status: '执行中' },
    { id: 'YD-2026-09', party: '待签约', type: '月度竞价', volume: 12200, price: null, signDate: '2026-08-20', period: '9月', status: '待签约' },
    { id: 'LD-2026-08', party: '绿电挂牌', type: '月度绿电', volume: 6100, price: 0.484, signDate: '2026-07-28', period: '8月', status: '执行中' }
  ]
};
