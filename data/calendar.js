// 交易日历数据
module.exports = {
  today: {
    date: '2026-08-16',
    weekday: '周日',
    items: [
      { name: '日前现货申报截止', time: '10:00', status: 'pending', priority: 'high', desc: '申报8/17日96点负荷曲线', deadline: '2026-08-17T10:00:00' },
      { name: '日前出清结果发布', time: '14:00', status: 'pending', priority: 'medium', desc: '查看8/17日出清电价和成交电量', deadline: '2026-08-17T14:00:00' },
      { name: '9月月度集中竞价', time: '09:00', status: 'upcoming', priority: 'high', desc: '申报9月月度电量和电价', daysLeft: 5 },
      { name: '8月绿电挂牌交易', time: '全天', status: 'upcoming', priority: 'medium', desc: '绿电挂牌摘牌，补充绿电缺口', daysLeft: 2 },
      { name: '8月结算单发布', time: '09:00', status: 'upcoming', priority: 'medium', desc: '核对8月全月电费', daysLeft: 16 }
    ]
  },
  month: {
    august: [
      { day: 1, events: [{ text: '42号令正式施行', type: 'policy' }] },
      { day: 5, events: [{ text: '需求响应（削峰14-16点）', type: 'dr' }] },
      { day: 12, events: [{ text: '需求响应（削峰14-16点）', type: 'dr' }] },
      { day: 18, events: [{ text: '绿电挂牌交易', type: 'green' }] },
      { day: 20, events: [{ text: '9月月度集中竞价', type: 'trading' }] },
      { day: 25, events: [{ text: '年度合同分月调整', type: 'trading' }] },
      { day: 28, events: [{ text: '8月结算预审', type: 'settlement' }] }
    ],
    september: [
      { day: 1, events: [{ text: '8月结算单发布', type: 'settlement' }] },
      { day: 10, events: [{ text: '9月绿电交易', type: 'green' }] },
      { day: 15, events: [{ text: '三季度双边协商', type: 'trading' }] },
      { day: 20, events: [{ text: '10月月度集中竞价', type: 'trading' }] }
    ]
  },
  schedule: [
    { product: '日前现货', frequency: '每日', declareTime: 'D-1日 10:00前', resultTime: 'D-1日 14:00', content: '96点负荷曲线', note: '用户侧只报量不报价' },
    { product: '实时市场', frequency: '实时', declareTime: '滚动', resultTime: '每15分钟', content: '实际用电', note: '偏差按实时价结算' },
    { product: '月度集中竞价', frequency: '每月', declareTime: '每月20日左右', resultTime: '当日', content: '下月电量+电价', note: '买卖双方申报撮合成交' },
    { product: '月内挂牌', frequency: '工作日', declareTime: '全天', resultTime: '摘牌即成交', content: '电量+电价', note: '调整当月电量偏差' },
    { product: '绿电挂牌', frequency: '每月', declareTime: '月中', resultTime: '挂牌周期内', content: '绿电量+价格', note: '环境价值单独计价' },
    { product: '需求响应', frequency: '事件触发', declareTime: '邀约发布后', resultTime: '竞价出清', content: '响应容量+报价', note: '广东削峰上限2.7元/kWh' },
    { product: '年度交易', frequency: '每年', declareTime: '11-12月', resultTime: '集中组织', content: '年度电量+电价', note: '锁定基础电量' }
  ],
  logs: [
    { time: '8/15 09:45', operator: '交易策略师Agent', action: '生成8/16日前申报建议', status: '已完成' },
    { time: '8/15 09:30', operator: '系统', action: '接收次日系统负荷预测', status: '已完成' },
    { time: '8/14 10:12', operator: '张工', action: '提交8/15日前申报（96点）', status: '已确认' },
    { time: '8/14 14:05', operator: '系统', action: '8/15日前出清结果发布', status: '已查看' },
    { time: '8/14 09:20', operator: '算力调度师Agent', action: '下达8/15算力调度指令', status: '已执行' },
    { time: '8/13 16:30', operator: '张工', action: '申报需求响应：35MW，2.5元/kWh', status: '已中标' },
    { time: '8/13 10:08', operator: '张工', action: '提交8/14日前申报', status: '已确认' },
    { time: '8/12 15:00', operator: '系统', action: '需求响应执行完成：实际压减34.2MW', status: '已结算' },
    { time: '8/12 09:15', operator: '绿电合规师Agent', action: '绿电缺口预警：本月缺口2.3%', status: '处理中' },
    { time: '8/11 14:00', operator: '系统', action: '8/12日前出清：均价0.425元/kWh', status: '已查看' }
  ],
  // 简单的智能体查询
  agentQuery: function(question) {
    const q = question.toLowerCase();
    if (q.includes('申报') || q.includes('日前')) {
      return '今日（8/16）为周日，下一申报日为8/17（周一）。请于10:00前提交8/17日96点负荷曲线。建议：10-14点低价段满额申报弹性负荷（108MW），18-20点高峰段仅申报刚性负荷（63MW）。';
    }
    if (q.includes('绿电') || q.includes('合规')) {
      return '当前绿电消纳进度22.5%，距30%目标缺口7.5个百分点。建议：8月18日绿电挂牌交易补购，或紧急采购绿证约2.7万张（约14.7万元）。';
    }
    if (q.includes('电价') || q.includes('价格')) {
      return '8月9日广东日前均价0.388元/kWh，峰段最高0.823元（18:00），谷段最低0.200元（12:00），峰谷价差0.623元。预测下周价格维持震荡，午间光伏低谷时段仍有套利空间。';
    }
    if (q.includes('需求响应') || q.includes('削峰')) {
      return '当前可申报容量37MW，响应速度5分钟。广东2026年削峰补偿2.7元/kWh。下次邀约预计8月18日前后，按37MW×2h计算单次收益约19.98万元。';
    }
    if (q.includes('结算') || q.includes('电费')) {
      return '8月预计总电费2678万元，度电成本0.524元/kWh，较7月下降3.2%。中长期对冲收益340万元，峰谷套利52.8万元，需求响应收益40万元，净优化收益372.8万元。';
    }
    return '我可以帮您查询：电价信息、申报建议、绿电合规、需求响应、结算数据。请具体描述您的问题。';
  }
};
