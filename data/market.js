// 市场总览数据 - 2026年8月
module.exports = {
  overview: {
    date: '2026-08-15',
    province: '广东',
    dayAheadAvg: 0.388,      // 元/kWh
    dayAheadChange: -2.3,    // %
    peakPrice: 0.823,
    valleyPrice: 0.200,
    spread: 0.623,
    greenCertPrice: 5.43,    // 元/张
    greenCertChange: 5.2,    // %
    greenPremium: 0.046,     // 元/kWh
    longTermPrice: 0.410,    // 月度集中竞价
    annualContractPrice: 0.372
  },
  provinces: [
    { name: '广东', daMax: 0.438, daMin: 0.338, rtMax: 0.458, rtMin: 0.349, avg: 0.388 },
    { name: '山东', daMax: 0.523, daMin: 0.194, rtMax: 0.510, rtMin: 0.176, avg: 0.358 },
    { name: '山西', daMax: 0.399, daMin: 0.248, rtMax: 0.497, rtMin: 0.261, avg: 0.324 },
    { name: '蒙西', daMax: 0.347, daMin: 0.200, rtMax: 0.396, rtMin: 0.224, avg: 0.310 },
    { name: '陕西', daMax: 0.343, daMin: 0.079, rtMax: 0.296, rtMin: 0.088, avg: 0.210 },
    { name: '辽宁', daMax: 0.403, daMin: -0.016, rtMax: 0.463, rtMin: -0.067, avg: 0.195 },
    { name: '江苏', daMax: 0.388, daMin: 0.284, rtMax: 0.385, rtMin: 0.293, avg: 0.336 },
    { name: '安徽', daMax: 0.311, daMin: 0.198, rtMax: 0.336, rtMin: 0.220, avg: 0.254 }
  ],
  policies: [
    {
      tag: '42号令',
      tagColor: '#ef4444',
      title: '《可再生能源消费最低比重目标和可再生能源电力消纳责任权重制度实施办法》正式施行',
      desc: '2026年8月1日起，数据中心等五大重点用能行业须完成可再生能源消费最低比重，绿证为唯一核算凭证，未达标将被约谈通报并纳入信用记录。',
      date: '2026-08-01'
    },
    {
      tag: '绿电直连',
      tagColor: '#10b981',
      title: '688号文：多用户绿电直连政策落地',
      desc: '国家发改委、能源局印发通知，绿电直连从"一对一"拓展至"一对多"，多个数据中心可共享专线直连新能源电站，降低用电成本并实现绿电溯源。',
      date: '2026-05-20'
    },
    {
      tag: '需求响应',
      tagColor: '#f59e0b',
      title: '广东2026削峰需求响应年度交易：2.7元/kWh',
      desc: '广东电力交易中心开展2026年度需求响应交易，削峰补偿2.7元/度、填谷0.298元/度，虚拟电厂和符合条件的电力用户均可参与。',
      date: '2026-07-25'
    }
  ]
};
