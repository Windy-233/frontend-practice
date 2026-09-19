const form = document.querySelector('#add-form');
const titleInput = document.querySelector('#title-input');
const authorInput = document.querySelector('#author-input');
const categoryInput = document.querySelector('#category-input');
const ratingInput = document.querySelector('#rating-input');
const categoryFilter = document.querySelector('#category-filter');
const ratingFilter = document.querySelector('#rating-filter');
const tip = document.querySelector('#tip');
const list = document.querySelector('#book-list');
const statusEl = document.querySelector('#status');

let books = [];
let chart = null;

const renderSummary = () => {
  const total = books.length;
  const avg = total === 0 ? 0 : (books.reduce((s, b) => s + b.rating, 0) / total).toFixed(1);
  const categories = new Set(books.map(b => b.category)).size;
  const fiveStar = books.filter(b => b.rating === 5).length;
  const cards = [
    { label: '图书总数', value: total },
    { label: '平均评分', value: avg },
    { label: '类别数', value: categories },
    { label: '五星图书', value: fiveStar }
  ];
  const box = document.querySelector('#summary-cards');
  box.innerHTML = '';
  cards.forEach(c => {
    box.insertAdjacentHTML('beforeend', `
            <div class="col-6 col-md-3">
                <div class="card">
                    <div class="card-body">
                        <h3 class="card-title h6 text-primary">${c.label}</h3>
                        <p class="card-text fs-4">${c.value}</p>
                    </div>
                </div>
            </div>
        `);
  });
};

const save = () => localStorage.setItem('books', JSON.stringify(books));

const renderBooks = () => {
  list.innerHTML = '';
  const minRating = ratingFilter.value === 'all' ? 0 : Number(ratingFilter.value);
  const category = categoryFilter.value;
  const shown = books.filter(b =>
    (category === 'all' || b.category === category) &&
    b.rating >= minRating
  );
  if (shown.length === 0) {
    list.innerHTML = '<li class="list-group-item">没有符合条件的图书</li>';
    return;
  }
  shown.forEach(book => {
    list.insertAdjacentHTML('beforeend', `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${book.title} · ${book.author} · ${book.category} · ${'★'.repeat(book.rating)}</span>
                <span class="del badge text-bg-danger" data-id="${book.id}" style="cursor:pointer">删除</span>
            </li>
        `);
  });
};

const loadBooks = async () => {
  const saved = localStorage.getItem('books');
  if (saved) {
    books = JSON.parse(saved);
  } else {
    const res = await fetch('data/books-list.json');
    books = await res.json();
  }
  renderBooks();
  renderSummary();
};

const renderChart = (data) => {
  if (chart === null) {
    chart = echarts.init(document.querySelector('#usage-chart'));
  }
  chart.setOption({
    title: { text: '各月各品类借阅量（册）', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { bottom: 60 },
    xAxis: { data: data.months },
    yAxis: { name: '册' },
    series: data.series.map(s => ({
      name: s.category,
      type: 'bar',
      data: s.counts
    }))
  });
};

const loadChart = async () => {
  statusEl.textContent = '加载中...';
  statusEl.style.display = 'block';
  try {
    const res = await fetch('data/books.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data.series.length === 0) {
      statusEl.textContent = '暂无数据';
      return;
    }
    statusEl.style.display = 'none';
    renderChart(data);
  } catch (error) {
    statusEl.textContent = '加载失败：' + error.message;
  }
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const category = categoryInput.value.trim();
  if (title === '' || author === '' || category === '') {
    tip.textContent = '书名、作者、类别都不能为空';
    return;
  }
  books.push({
    id: Date.now(),
    title: title,
    author: author,
    category: category,
    rating: Number(ratingInput.value)
  });
  tip.textContent = '';
  titleInput.value = '';
  authorInput.value = '';
  categoryInput.value = '';
  save();
  renderBooks();
  renderSummary();
});

list.addEventListener('click', (e) => {
  if (e.target.classList.contains('del')) {
    const id = Number(e.target.dataset.id);
    books = books.filter(b => b.id !== id);
    save();
    renderBooks();
    renderSummary();
  }
});

categoryFilter.addEventListener('change', renderBooks);
ratingFilter.addEventListener('change', renderBooks);

window.addEventListener('resize', () => {
  if (chart) chart.resize();
});

loadBooks();
loadChart();