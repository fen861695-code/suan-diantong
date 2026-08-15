// 工作台数据 - 真实工作场景
module.exports = {
  // 今日待办任务（按真实交易时间线）
  tasks: [
    {
      id: 'T001',
      title: '提交8月17日日前现货申报',
      deadline: '2026-08-16 12:00',
      status: 'urgent',
      priority: 'high',
      category: '现货申报',
      description: '需提交96点负荷曲线，当前为草稿状态，待主管审核',
      assignee: '交易员-张明',
      progress: 60
    },
    {
      id: 'T002',
      title: '9月月度集中竞价申报',
      deadline: '2026-08-20 17:00',
      status: 'pending',
      priority: 'high',
      category: '中长期',
      description: '申报9月月度合约电量1.22亿kWh，需确认价格区间',
      assignee: '交易主管-李华',
      progress: 20
    },
    {
      id: 'T003',
      title: '8月绿电挂牌交易补购',
      deadline: '2026-08-18 10:00',
      status: 'pending',
      priority: 'high',
      category: '绿电交易',
      description: '当前绿电消纳缺口7.5个百分点，需紧急补购绿证2.7万张',
      assignee: '合规专员-王芳',
      progress: 0
    },
    {
      id: 'T004',
      title: '核对8月14日日清分单',
      deadline: '2026-08-16 18:00',
      status: 'pending',
      priority: 'medium',
      category: '结算对账',
      description: 'D+1日核对日前与实时市场偏差费用，确认中长期合约分解电量',
      assignee: '结算专员-赵强',
      progress: 0
    },
    {
      id: 'T005',
      title: '需求响应邀约确认（8月17日）',
      deadline: '2026-08-16 12:00',
      status: 'pending',
      priority: 'medium',
      category: '需求响应',
      description: '调度机构发布削峰邀约37MW/2h，补偿2.7元/kWh，需确认是否参与',
      assignee: '交易员-张明',
      progress: 0
    },
    {
      id: 'T006',
      title: '编写8月14日交易日报',
      deadline: '2026-08-16 17:30',
      status: 'pending',
      priority: 'low',
      category: '日报',
      description: '汇总日前出清结果、实时偏差、收益情况，发送飞书群',
      assignee: '交易员-张明',
      progress: 0
    }
  ],

  // 实时市场状态
  marketStatus: {
    date: '2026-08-16',
    dayAheadPublished: true,        // 日前出清已发布
    dayAheadPublishTime: '14:00',
    realtimeRunning: true,          // 实时市场运行中
    currentHour: 20,
    currentPrice: 0.612,            // 当前实时电价
    dayAheadPrice: 0.598,           // 同时段日前价
    systemLoad: 98200,              // 系统负荷 MW
    renewableRatio: 28.5,           // 新能源占比
    nextEvent: '8月17日日前市场申报截止 今日12:00',
    countdown: '7小时9分'
  },

  // 实时偏差监控
  deviation: {
    today: {
      declared: 4820,    // 今日申报电量 MWh
      actual: 4756,      // 实际用电量 MWh
      deviation: -64,    // 偏差 MWh
      deviationRate: -1.33, // 偏差率 %
      penaltyThreshold: 3, // 偏差考核阈值 %
      penaltyEstimate: 0,  // 预计偏差费用（元）
      status: 'normal'
    },
    currentHour: {
      declared: 63,      // 当前时段申报 MW
      actual: 61.2,      // 实际负荷 MW
      deviation: -1.8,
      deviationRate: -2.86,
      status: 'warning'
    },
    hourlyData: (() => {
      const hours = Array.from({length: 24}, (_, i) => i);
      const declared = [72,70,68,66,65,66,68,72,78,82,85,88,92,95,93,90,85,78,68,63,62,65,68,70];
      const actual = declared.map((d, i) => {
        const noise = Math.sin(i * 1.3) * 4 + (Math.random() - 0.5) * 6;
        return Math.round((d + noise) * 10) / 10;
      });
      return { hours, declared, actual };
    })()
  },

  // 告警信息
  alerts: [
    { level: 'danger', time: '20:05', title: '实时偏差接近考核阈值', content: '当前时段实际负荷61.2MW，申报63MW，偏差率-2.86%，接近±3%考核线' },
    { level: 'warning', time: '14:30', title: '日前出清价格高于预期', content: '8月16日18:00出清价0.823元/kWh，高于预测0.756元，建议增加弹性负荷压减' },
    { level: 'warning', time: '09:15', title: '绿电消纳缺口预警', content: '当前消纳比例22.5%，距30%目标差7.5个百分点，距年底138天' },
    { level: 'info', time: '08:00', title: '需求响应邀约', content: '调度机构发布8月17日削峰邀约，容量37MW，补偿2.7元/kWh' }
  ],

  // 今日交易概览
  todaySummary: {
    dayAheadAvg: 0.388,
    realtimeAvg: 0.372,
    totalCostToday: 89.2,      // 万元
    savingToday: 5.3,          // 万元
    deviationCost: 0,          // 偏差费用
    drRevenue: 0,              // 需求响应收益
    positions: {
      longTerm: 75,    // 中长期覆盖%
      spot: 25,        // 现货%
      green: 10        // 绿电%
    }
  },

  // 申报状态流转
  declarationStatus: {
    currentStage: 'draft',  // draft → reviewing → approved → submitted → cleared
    stages: [
      { key: 'draft', label: '草拟', time: '09:30', user: '张明', done: true },
      { key: 'reviewing', label: '审核中', time: null, user: '李华', done: false, current: true },
      { key: 'approved', label: '审核通过', time: null, user: null, done: false },
      { key: 'submitted', label: '已提交', time: null, user: null, done: false },
      { key: 'cleared', label: '已出清', time: null, user: null, done: false }
    ],
    deadline: '2026-08-15 12:00',
    curvePoints: 96
  },

  // 操作日志
  operationLogs: [
    { time: '2026-08-15 20:05', user: '系统', action: '偏差预警', target: '20:00时段', detail: '偏差率-2.86%，接近考核阈值', type: 'alert' },
    { time: '2026-08-15 14:30', user: '张明', action: '查看出清结果', target: '8月16日日前市场', detail: '日前均价0.388元/kWh，峰0.823/谷0.200', type: 'query' },
    { time: '2026-08-15 10:15', user: '张明', action: '保存申报草稿', target: '8月16日96点曲线', detail: '总申报电量1822MWh，预计电费67.1万元', type: 'submit' },
    { time: '2026-08-15 09:30', user: '张明', action: '生成AI推荐方案', target: '日前申报', detail: '低谷满额/平段50%/高峰0%，预计日省5.28万元', type: 'ai' },
    { time: '2026-08-15 08:45', user: '王芳', action: '更新绿电持仓', target: '绿电合规', detail: '8月已签约绿电1200万kWh，消纳比例22.5%', type: 'update' },
    { time: '2026-08-14 17:50', user: '赵强', action: '确认日清分单', target: '8月13日结算', detail: '日电费87.6万元，偏差费用-0.3万元，已确认', type: 'approve' },
    { time: '2026-08-14 16:20', user: '张明', action: '提交需求响应报名', target: '8月12日削峰', detail: '35MW/2h，出清价2.7元/kWh，收益18.9万元', type: 'submit' }
  ],

  // 日报模板数据
  dailyReport: {
    date: '2026-08-14',
    weather: '晴，35°C',
    dayAheadAvg: 0.392,
    realtimeAvg: 0.381,
    totalVolume: 4980,
    totalCost: 87.6,
    longTermCost: 65.7,
    spotCost: 21.9,
    deviationCost: -0.3,
    drRevenue: 18.9,
    netOptimization: 5.8,
    maxPrice: 0.812,
    maxPriceHour: '18:00',
    minPrice: 0.198,
    minPriceHour: '12:00',
    declaredVolume: 5020,
    actualVolume: 4980,
    forecastAccuracy: 99.2,
    events: [
      '参与8月12日削峰需求响应，35MW/2h，收益18.9万元（已结算）',
      '18:00时段现货价0.812元/kWh，弹性负荷压减至0，节省约3.2万元',
      '12:00光伏大发时段电价0.198元/kWh，训练任务满负荷运行',
      '全天偏差率-0.8%，优于±3%考核线，无偏差罚款'
    ],
    tomorrowPlan: [
      '8月16日12:00前提交8月17日日前申报（96点曲线）',
      '关注18:00晚高峰价格预测0.823元/kWh，建议弹性负荷全停',
      '确认8月17日需求响应邀约（37MW/2h，2.7元/kWh）',
      '8月18日绿电挂牌交易，补购绿证2.7万张'
    ]
  }
};
