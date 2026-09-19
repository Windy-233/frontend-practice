const STUDYROOMS = [
  {
    "name": "楠苑一楼自习室",
    "building": "楠苑",
    "floor": 1,
    "seats": 120,
    "occupied": 86,
    "status": "开放",
    "hours": "08:00-22:30"
  },
  {
    "name": "楠苑二楼自习室",
    "building": "楠苑",
    "floor": 2,
    "seats": 96,
    "occupied": 61,
    "status": "开放",
    "hours": "08:00-22:30"
  },
  {
    "name": "楠苑三楼研讨自习室",
    "building": "楠苑",
    "floor": 3,
    "seats": 48,
    "occupied": 33,
    "status": "开放",
    "hours": "09:00-21:00"
  },
  {
    "name": "梓苑一楼自习室",
    "building": "梓苑",
    "floor": 1,
    "seats": 140,
    "occupied": 92,
    "status": "开放",
    "hours": "08:00-22:30"
  },
  {
    "name": "梓苑二楼自习室",
    "building": "梓苑",
    "floor": 2,
    "seats": 88,
    "occupied": 0,
    "status": "维修",
    "hours": "暂停开放"
  },
  {
    "name": "图书馆一楼自习区",
    "building": "图书馆",
    "floor": 1,
    "seats": 160,
    "occupied": 118,
    "status": "开放",
    "hours": "07:30-23:00"
  },
  {
    "name": "图书馆二楼自习区",
    "building": "图书馆",
    "floor": 2,
    "seats": 130,
    "occupied": 95,
    "status": "开放",
    "hours": "07:30-23:00"
  },
  {
    "name": "图书馆三楼静音自习室",
    "building": "图书馆",
    "floor": 3,
    "seats": 60,
    "occupied": 58,
    "status": "开放",
    "hours": "08:00-22:00"
  },
  {
    "name": "理科楼一层通宵自习室",
    "building": "理科楼",
    "floor": 1,
    "seats": 80,
    "occupied": 41,
    "status": "开放",
    "hours": "全天开放"
  },
  {
    "name": "理科楼三层自习室",
    "building": "理科楼",
    "floor": 3,
    "seats": 72,
    "occupied": 0,
    "status": "闭馆",
    "hours": "08:00-22:00"
  },
  {
    "name": "文科楼二层自习室",
    "building": "文科楼",
    "floor": 2,
    "seats": 66,
    "occupied": 52,
    "status": "开放",
    "hours": "08:00-22:00"
  },
  {
    "name": "文科楼四层考研自习室",
    "building": "文科楼",
    "floor": 4,
    "seats": 110,
    "occupied": 103,
    "status": "开放",
    "hours": "07:00-23:30"
  }
]

const statusEl = document.querySelector('#status');

const renderSummary = () => {
  const open = STUDYROOMS.filter(r => r.status === '开放').length;
  const seats = STUDYROOMS.reduce((sum, r) => sum + r.seats, 0);
  const free = STUDYROOMS.reduce((sum, r) => sum + (r.seats - r.occupied), 0);
  const cards = [
    { label: '自习室总数', value: STUDYROOMS.length },
    { label: '当前开放', value: open },
    { label: '总座位数', value: seats },
    { label: '空余座位', value: free }
  ];
  const box = document.querySelector('#summary-cards');
  box.innerHTML = '';
  cards.forEach(c => {
    box.insertAdjacentHTML('beforeend', `
      <div class="col-6 col-md-3">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title h6">${c.label}</h3>
            <p class="card-text fs-4">${c.value}</p>
          </div>
        </div>
      </div>
    `);
  });
};

const badgeClass = { '开放': 'text-bg-success', '闭馆': 'text-bg-secondary', '维修': 'text-bg-warning' };

const renderRooms = () => {
  const floor = document.querySelector('#floor-filter').value;
  const status = document.querySelector('#status-filter').value;
  const shown = STUDYROOMS.filter(r =>
    (floor === 'all' || r.floor === Number(floor)) &&
    (status === 'all' || r.status === status)
  );
  const list = document.querySelector('#room-list');
  list.innerHTML = '';
  if (shown.length === 0) {
    list.innerHTML = '<li class="list-group-item">没有符合条件的自习室</li>';
    return;
  }
  shown.forEach(r => {
    list.insertAdjacentHTML('beforeend', `
      <li class="list-group-item">
        <span>${r.name} -- ${r.building}${r.floor}层 -- 空余${r.seats - r.occupied}座</span>
        <span class="badge ${badgeClass[r.status]}">${r.status} : ${r.hours}</span>
      </li>
    `);
  });
};

document.querySelector('#floor-filter').addEventListener('change', renderRooms);
document.querySelector('#status-filter').addEventListener('change', renderRooms);

let chart = null;

const renderChart = (data) => {
  if (chart === null) {
    chart = echarts.init(document.querySelector('#usage-chart'));
  }
  chart.setOption({
    title: { text: data.title, left: 'center' },
    tooltip: { trigger: 'axis' },
    grid: { left: 56, right: 24, bottom: 90 },
    xAxis: {
      type: 'category',
      data: data.rooms.map(r => r.name),
      axisLabel: { rotate: 38, interval: 0, fontSize: 11 }
    },
    yAxis: { type: 'value', name: '座' },
    series: [{
      name: '空余座位',
      type: 'bar',
      data: data.rooms.map(r => r.seats - r.occupied),
      itemStyle: { color: '#0d6efd' }
    }]
  });
};

const loadChart = async () => {
  statusEl.textContent = '加载中...';
  statusEl.style.display = 'block';
  try {
    const response = await fetch('data/studyrooms.json');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (data.rooms.length === 0) {
      statusEl.textContent = '暂无数据';
      return;
    }
    statusEl.style.display = 'none';
    renderChart(data);
  } catch (error) {
    statusEl.textContent = '加载失败：' + error.message;
  }
};

window.addEventListener('resize', () => {
  if (chart) chart.resize();
});

renderSummary();
renderRooms();
loadChart();