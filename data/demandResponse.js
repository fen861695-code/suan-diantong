// 需求响应数据
module.exports = {
  capability: {
    capacity: 37,         // MW
    speed: '5分钟',
    duration: '2-4小时',
    markets: ['广东需求响应', '虚拟电厂', '辅助服务调频'],
    flexibleLoad: '训练任务30MW + 批处理10MW + 制冷调节3.6MW'
  },
  provinces: [
    { province: '广东', peakComp: 2.7, valleyComp: 0.298, speed: '5-30分钟', status: '三大运营商已接入' },
    { province: '上海', peakComp: 9.0, valleyComp: null, speed: '分钟级', status: '16家数据中心已参与' },
    { province: '广州', peakComp: 3.5, valleyComp: null, speed: '分钟级', status: '虚拟电厂聚合' },
    { province: '山东', peakComp: 4.0, valleyComp: 0.3, speed: '15分钟', status: '算电协同验证完成' }
  ],
  history: [
    { date: '2026-08-12', type: '削峰', period: '14:00-16:00', capacity: 35, price: 2.7, revenue: 189000 },
    { date: '2026-08-05', type: '削峰', period: '15:00-17:00', capacity: 32, price: 2.5, revenue: 160000 },
    { date: '2026-07-28', type: '填谷', period: '01:00-05:00', capacity: 18, price: 0.298, revenue: 21456 },
    { date: '2026-07-20', type: '削峰', period: '14:00-16:00', capacity: 30, price: 2.3, revenue: 138000 },
    { date: '2026-07-15', type: '削峰', period: '15:00-17:00', capacity: 28, price: 2.0, revenue: 112000 }
  ]
};
