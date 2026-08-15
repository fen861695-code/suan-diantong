// 结算对账数据 - 2026年8月
module.exports = {
  summary: {
    totalCost: 26780000,      // 元
    totalVolume: 51080000,    // kWh
    costPerKwh: 0.524,
    lastMonthCost: 0.513,
    change: -3.2
  },
  // 电费构成（万元）
  composition: [
    { name: '中长期合约电费', value: 1467, color: '#00d4ff' },
    { name: '日前现货电费', value: 297, color: '#ff6b35' },
    { name: '实时偏差电费', value: 36, color: '#f59e0b' },
    { name: '绿电环境溢价', value: 24, color: '#10b981' },
    { name: '输配电费', value: 766, color: '#8b5cf6' },
    { name: '政府性基金', value: 128, color: '#64748b' },
    { name: '需求响应抵扣', value: -40, color: '#10b981' }
  ],
  // 日清分（8月1-15日）
  daily: {
    dates: ['8/1','8/2','8/3','8/4','8/5','8/6','8/7','8/8','8/9','8/10','8/11','8/12','8/13','8/14','8/15'],
    cost: [82,85,91,78,76,73,70,88,95,102,108,96,88,84,80],
    spotPrice: [0.365,0.372,0.412,0.358,0.342,0.335,0.328,0.398,0.425,0.455,0.485,0.410,0.385,0.372,0.358]
  },
  // 最近7天明细表
  detail: [
    { date: '8/9', volume: 168, ltCost: 48.2, spotCost: 9.8, devCost: 1.2, total: 80.0, unitCost: 0.476 },
    { date: '8/10', volume: 172, ltCost: 49.4, spotCost: 12.5, devCost: 2.1, total: 84.0, unitCost: 0.488 },
    { date: '8/11', volume: 175, ltCost: 50.2, spotCost: 14.8, devCost: 3.5, total: 88.0, unitCost: 0.503 },
    { date: '8/12', volume: 170, ltCost: 48.8, spotCost: 18.2, devCost: 5.8, total: 96.0, unitCost: 0.565 },
    { date: '8/13', volume: 178, ltCost: 51.0, spotCost: 22.5, devCost: 8.2, total: 108.0, unitCost: 0.607 },
    { date: '8/14', volume: 175, ltCost: 50.2, spotCost: 19.8, devCost: 6.5, total: 102.0, unitCost: 0.583 },
    { date: '8/15', volume: 170, ltCost: 48.8, spotCost: 16.5, devCost: 4.2, total: 95.0, unitCost: 0.559 }
  ],
  deviation: {
    volume: 1020000,       // kWh
    cost: 360000,          // 元
    rate: 2.0,
    threshold: 3.0,
    maxDailyRate: 5.2,
    maxDailyDate: '8/13',
    reason: '8/13突发在线推理流量增长12%，导致刚性负荷超预期',
    suggestion: '优化负荷预测模型，引入业务流量预测因子'
  },
  pnl: [
    { name: '中长期合约对冲收益', value: 3400000, positive: true, desc: '现货高于合约价时段锁定低价' },
    { name: '峰谷套利收益', value: 528000, positive: true, desc: '弹性负荷迁移至低价时段' },
    { name: '需求响应净收益', value: 400000, positive: true, desc: '2次削峰+1次填谷' },
    { name: '实时偏差损失', value: -360000, positive: false, desc: '实际用电超申报2%' },
    { name: '绿电溢价成本', value: -240000, positive: false, desc: '绿电环境溢价0.046元/kWh' }
  ],
  netBenefit: 3728000
};
