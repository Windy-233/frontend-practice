const listBox = document.querySelector('#pack-list');
const searchInput = document.querySelector('#search-input');
const typeFilter = document.querySelector('#type-filter');
let packs = [];
let packChart = null;
const renderChart = () => {
    const grouped = {};
    packs.forEach(p => {
        if (!grouped[p.type]) grouped[p.type] = 0;
        grouped[p.type] += p.downloads;
    });
    const types = Object.keys(grouped);
    const totals = types.map(t => grouped[t]);
    packChart = echarts.init(document.querySelector('#pack-chart'));
    packChart.setOption({
        title: { text: '各类型整合包下载次数统计（次）', left: 'center' },
        tooltip: { trigger: 'axis' },
        grid: { left: 90, right: 30, top: 60, bottom: 40 },
        xAxis: { type: 'value', name: '次' },
        yAxis: { type: 'category', data: types },
        series: [{ name: '下载次数', type: 'bar', data: totals }]
    });
};
const renderList = () => {
    const keyword = searchInput.value.trim();
    const type = typeFilter.value;
    const shown = packs.filter(p =>
        (keyword === '' || p.name.includes(keyword)) &&
        (type === 'all' || p.type === type)
    );
    listBox.innerHTML = '';
    $('#count-tip').text('共 ' + shown.length + ' 个整合包');
    if (shown.length === 0) {
        listBox.insertAdjacentHTML('beforeend', '<p class="text-muted">没有符合条件的整合包</p>');
        return;
    }
    shown.forEach(p => {
        listBox.insertAdjacentHTML('beforeend', `
      <div class="list-row">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <div>
            <span class="tag">${p.type}</span>
            <strong>${p.name}</strong>
            <span class="text-muted">适用版本 ${p.version}　下载 ${p.downloads} 次</span>
          </div>
          <span class="pack-link"><a href="${p.url}" target="_blank">MC百科</a></span>
        </div>
        <p class="mb-1 text-muted">${p.summary}</p>
      </div>
    `);
    });
};
const loadPacks = async () => {
    $('#status').text('加载中...').show();
    try {
        const res = await fetch('data/modpacks.json');
        if (!res.ok) {
            throw new Error('HTTP ' + res.status);
        }
        const data = await res.json();
        if (data.modpacks.length === 0) {
            $('#status').text('暂无数据').show();
            return;
        }
        packs = data.modpacks;
        $('#status').hide();
        renderList();
        renderChart();
    } catch (error) {
        $('#status').text('加载失败：' + error.message).show();
    }
};
searchInput.addEventListener('input', renderList);
typeFilter.addEventListener('change', renderList);
window.addEventListener('resize', () => {
    if (packChart) {
        packChart.resize();
    }
});
loadPacks();