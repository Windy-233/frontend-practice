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
const report = (list) => {
    const valid = cleanRecords(list);
    if (valid.length === 0) {
    return '没有有效记录';
    }
    const total = totalAmount(valid);
    const max = maxExpense(valid);
    return `有效记录数：${valid.length}条 总支出：${total}元 最大开销：${max.name}（${max.amount}元）`;
};
try {
    console.log(report(records));
} catch (err) {
    console.error('程序出错：', err.message);
}