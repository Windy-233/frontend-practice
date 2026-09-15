const loadData = async () => {
  $('#status').text('加载中...').show();
  try {
    const [booksRes, roomsRes] = await Promise.all([
      fetch('data/books.json'),
      fetch('data/studyrooms.json')
    ]);
    if (!booksRes.ok || !roomsRes.ok) throw new Error('HTTP ' + booksRes.status);
    const books = await booksRes.json();
    const rooms = await roomsRes.json();
    if (books.series.length === 0 || rooms.rooms.length === 0) {
      $('#status').text('暂无数据');
      return;
    }
    $('#status').hide();
    $('#source').text(books.title + ' · ' + books.source);
    renderBar(books);
} catch (err) {
    $('#status').text('加载失败：' + err.message).show();
  }
};
const renderBar = (data) => {
  const chart = echarts.init(document.querySelector('#bar-chart'));
  chart.setOption({
    title: { text: '各月借阅量（册）', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { data: data.months },
    yAxis: {},
    series: [{ type: 'bar', data: data.series[0].counts }]
  });
  window.addEventListener('resize', () => chart.resize());
};
loadData();