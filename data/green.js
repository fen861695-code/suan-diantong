// 绿电合规数据
module.exports = {
  compliance: {
    target: 30,          // 国家枢纽节点数据中心目标%
    current: 22.5,
    gap: 7.5,
    daysRemaining: 138,
    status: '预警',
    annualConsumption: 61300,  // 万kWh
    greenVolume: 13800,        // 已签约绿电 万kWh
    targetVolume: 18390        // 目标绿电量 万kWh
  },
  channels: [
    { name: '绿电直连', energyPrice: 0.35, premium: 0.03, cert: '按需', advantage: '价格低、可溯源', scenario: '新建数据中心', color: '#10b981' },
    { name: '绿电交易', energyPrice: 0.438, premium: 0.046, cert: '1张/千度', advantage: '灵活、市场化', scenario: '月度常态化采购', color: '#00d4ff' },
    { name: '绿证购买', energyPrice: null, premium: 5.43, cert: '单独购买', advantage: '最快补缺口', scenario: '紧急合规', color: '#f59e0b' },
    { name: '分布式光伏自发自用', energyPrice: 0.25, premium: 0, cert: '全部绿电', advantage: '长期最省', scenario: '有屋顶/土地', color: '#8b5cf6' }
  ],
  // 月度绿电持仓 vs 目标（万kWh）
  holdings: {
    months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    signed: [820,780,910,850,980,1020,1150,1200,1250,1280,1300,1350],
    target: [1080,1080,1080,1080,1080,1080,1080,1080,1080,1080,1080,1080]
  },
  advice: [
    { priority: 'high', text: '当前缺口7.5个百分点，建议8月紧急采购绿证约2.7万张（约14.7万元），确保月度合规。' },
    { priority: 'medium', text: '9月起增加绿电交易月度签约比例至15%，逐步减少对绿证的依赖。' },
    { priority: 'low', text: '长期建议推进绿电直连项目（688号文政策支持），可降低绿电采购成本约20%。' },
    { priority: 'medium', text: '注意：绿证必须为考核年度内生产电量的绿证，跨年绿证不计入合规核算。' }
  ]
};
