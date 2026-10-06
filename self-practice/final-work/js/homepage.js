const state = { mobs: [], packs: [], sales: [] };
let salesChart = null;
let openMode = '';
const renderCards = () => {
    const total = state.mobs.length;
    const hostile = state.mobs.filter(m => m.category === '敌对').length;
    const packCount = state.packs.length;
    const typeCount = new Set(state.packs.map(p => p.type)).size;
    const cards = [
        { label: '收录生物', value: total + ' 种' },
        { label: '敌对生物', value: hostile + ' 种' },
        { label: '收录整合包', value: packCount + ' 个' },
        { label: '整合包类型', value: typeCount + ' 种' }
    ];
    const box = document.querySelector('#summary-cards');
    box.innerHTML = '';
    cards.forEach(c => {
        box.insertAdjacentHTML('beforeend', `
      <div class="col-6 col-md-3">
        <div class="panel h-100">
          <h3 class="h6 text-muted">${c.label}</h3>
          <p class="summary-value">${c.value}</p>
        </div>
      </div>
    `);
    });
};
const renderSources = (site) => {
    const box = document.querySelector('#source-list');
    box.innerHTML = '';
    site.sources.forEach(s => {
        box.insertAdjacentHTML('beforeend', `<p class="mb-1">${s.name}：<a href="${s.url}" target="_blank">${s.url}</a></p>`);
    });
};
const renderSalesChart = () => {
    if (salesChart !== null) {
        salesChart.destroy();
    }
    const labels = state.sales.map(s => s.year);
    const data = state.sales.map(s => s.copies);
    const ctx = document.querySelector('#sales-chart');
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '累计销量（亿份）',
                data: data,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: '近年Minecraft累计销量（单位：亿份）' }
            }
        }
    });
};
const renderSalesSource = (data) => {
    const box = document.querySelector('#sales-source');
    box.innerHTML = '';
    box.insertAdjacentHTML('beforeend', `<p class="mb-1">${data.title}：${data.note}</p>`);
    data.points.forEach(p => {
        box.insertAdjacentHTML('beforeend', `<p class="mb-1">${p.year} ${p.copies}亿份，来源：<a href="${p.url}" target="_blank">${p.source}</a></p>`);
    });
};

const loadAll = async () => {
    $('#status').text('加载中...').show();
    try {
        const [siteRes, mobRes, packRes, salesRes] = await Promise.all([
            fetch('data/site.json'),
            fetch('data/mobs.json'),
            fetch('data/modpacks.json'),
            fetch('data/sales.json')
        ]);
        if (!siteRes.ok || !mobRes.ok || !packRes.ok || !salesRes.ok) {
            throw new Error('HTTP ' + siteRes.status);
        }
        const site = await siteRes.json();
        const mobData = await mobRes.json();
        const packData = await packRes.json();
        const salesData = await salesRes.json();
        if (mobData.mobs.length === 0 || packData.modpacks.length === 0) {
            $('#status').text('暂无数据').show();
            return;
        }
        state.mobs = mobData.mobs;
        state.packs = packData.modpacks;
        state.sales = salesData.points;
        $('#sub-title').text(site.subtitle);
        $('#status').hide();
        renderCards();
        renderSources(site);
        renderSalesChart();
        renderSalesSource(salesData);
    } catch (error) {
        $('#status').text('加载失败：' + error.message).show();
    }
};
$('.btn-detail').on('click', function () {
    const mode = this.dataset.mode;
    $('.mode-detail').hide();
    $('.btn-detail').text('查看详情');
    if (openMode !== mode) {
        $('#detail-' + mode).show();
        $(this).text('收起');
        openMode = mode;
    } else {
        openMode = '';
    }
});
loadAll();