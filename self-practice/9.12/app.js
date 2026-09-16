const state = { data: null, rooms: null };
let barChart = null;
let lineChart = null; 
const loadData = async () => {
  $('#status').text('加载中...').show();
  try {
    const t1 = Date.now();
    const [booksRes, roomsRes] = await Promise.all([
      fetch('data/books.json'),
      fetch('data/studyrooms.json')
    ]);
    console.log('并行耗时：', Date.now() - t1, 'ms');
    const t2 = Date.now();
  await fetch('data/books.json').then(r => r.json());
  await fetch('data/studyrooms.json').then(r => r.json());
  console.log('串行耗时：', Date.now() - t2, 'ms');
    if (!booksRes.ok || !roomsRes.ok) {
            throw new Error('HTTP ' + booksRes.status);
        }
    const books = await booksRes.json();
    const rooms = await roomsRes.json();
    if (books.series.length === 0 || rooms.rooms.length === 0) {
      $('#status').text('暂无数据');
      return;
    }
    state.data = books;
    state.rooms = rooms;
    $('#status').hide();
    $('#source').text(books.title + ' · ' + books.source);
    renderCards(books);
    renderBar(books);
    renderLine(rooms);
} catch (error) {
    $('#status').text('加载失败：' + error.message).show();
}
};
const renderCards = (data) => {
  data.series.forEach(s => {
    const total = s.counts.reduce((sum, n) => sum + n, 0);
    $('#cards').append(`
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title h6">${s.category}</h3>
            <p class="card-text fs-4">${total}</p>
          </div>
        </div>
      </div>
    `);
  });
};
const renderBar = (data) => {
   barChart = echarts.init(document.querySelector('#bar-chart'));
   barChart.setOption({
        title: { text: '各月借阅量（册）', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: { data: data.months },
        yAxis: {},
        series: [{ type: 'bar', data: data.series[0].counts }]
    });
}
const renderLine = (rooms) => {
    if (lineChart !== null) {
        lineChart.destroy();
    }
    const grouped = {};
    rooms.rooms.forEach(r => {
        if (!grouped[r.building]) grouped[r.building] = { seats: 0, occupied: 0 };
        grouped[r.building].seats += r.seats;
        grouped[r.building].occupied += r.occupied;
    });
    const series = Object.keys(grouped).map(b => ({
        category: b,
        counts: [Number(((grouped[b].occupied / grouped[b].seats) * 100).toFixed(1))]
    }));
    const ctx = document.querySelector('#line-chart');
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: series.map(s => s.category),
            datasets: [{
                label: '占用率(%)',
                data: series.map(s => s.counts[0]),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: '各楼栋座位占用率（%）' }
            },
        }
    });
};
window.addEventListener('resize', () => {
    if (barChart) barChart.resize();
});
$('#cards').on('click', '.card', function () {
    $(this).toggleClass('border-primary shadow');
});
loadData();