const records = [
    { name: '餐饮', amount: 150 },
    { name: '交通', amount: 50 },
    { name: '购物', amount: 300 },
    { name: '水电', amount: -20 },
    { name: '零食', amount: 'abc' },
    { name: '电影', amount: 80 },
]
const cleanRecords = (list) => list.filter(r => typeof r.amount === 'number' && r.amount >= 0);
const totalAmount = (list) => list.reduce((sum , r) => sum + r.amount, 0);
const maxExpense = (list) => list.reduce((max, r) => r.amount > max.amount ? r : max, list[0] || {});
console.log('清洗后记录：', cleanRecords(records));
console.log('总支出：',totalAmount(cleanRecords(records)));