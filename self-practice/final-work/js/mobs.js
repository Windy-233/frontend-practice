const listBox = document.querySelector('#mob-list');
const searchInput = document.querySelector('#search-input');
const dimensionFilter = document.querySelector('#dimension-filter');
const categoryFilter = document.querySelector('#category-filter');
const addForm = document.querySelector('#add-form');
const nameInput = document.querySelector('#name-input');
const healthInput = document.querySelector('#health-input');
const newDimension = document.querySelector('#new-dimension');
const newCategory = document.querySelector('#new-category');
let baseMobs = [];
let customMobs = JSON.parse(localStorage.getItem('customMobs') || '[]');

const saveCustom = () => {
    localStorage.setItem('customMobs', JSON.stringify(customMobs));
};
const allMobs = () => {
    const list = [];
    baseMobs.forEach(m => list.push(m));
    customMobs.forEach(m => list.push(m));
    return list;
};
const renderList = () => {
    const keyword = searchInput.value.trim();
    const dimension = dimensionFilter.value;
    const category = categoryFilter.value;
    const shown = allMobs().filter(m =>
        (keyword === '' || m.name.includes(keyword)) &&
        (dimension === 'all' || m.dimension === dimension) &&
        (category === 'all' || m.category === category)
    );
    listBox.innerHTML = '';
    $('#count-tip').text('共 ' + shown.length + ' 条记录');
    if (shown.length === 0) {
        listBox.insertAdjacentHTML('beforeend', '<p class="text-muted">没有符合条件的生物</p>');
        return;
    }
    shown.forEach(m => {
        const customTag = m.custom ? '<span class="tag tag-alt">自定义</span>' : '';
        const delBtn = m.custom ? '<span class="del badge text-bg-danger" data-id="' + m.id + '">删除</span>' : '';
        listBox.insertAdjacentHTML('beforeend', `
      <div class="list-row d-flex justify-content-between align-items-center">
        <div>
          <span class="tag">${m.dimension}</span>
          <span class="tag tag-alt">${m.category}</span>
          <strong>${m.name}</strong>
          <span class="text-muted">血量 ${m.health} 点</span>
          ${customTag}
        </div>
        <div>${delBtn}</div>
      </div>
    `);
    });
};
const loadMobs = async () => {
    $('#status').text('加载中...').show();
    try {
        const res = await fetch('data/mobs.json');
        if (!res.ok) {
            throw new Error('HTTP ' + res.status);
        }
        const data = await res.json();
        if (data.mobs.length === 0) {
            $('#status').text('暂无数据').show();
            return;
        }
        baseMobs = data.mobs;
        $('#status').hide();
        renderList();
    } catch (error) {
        $('#status').text('加载失败：' + error.message).show();
    }
};
addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (name === '') {
        $('#tip').text('名称不能为空');
        return;
    }
    const health = Number(healthInput.value);
    if (healthInput.value === '' || !(health > 0)) {
        $('#tip').text('血量必须是大于0的数字');
        return;
    }
    customMobs.push({
        id: Date.now(),
        name: name,
        health: health,
        dimension: newDimension.value,
        category: newCategory.value,
        custom: true
    });
    $('#tip').text('');
    nameInput.value = '';
    healthInput.value = '';
    saveCustom();
    renderList();
});
searchInput.addEventListener('input', renderList);
dimensionFilter.addEventListener('change', renderList);
categoryFilter.addEventListener('change', renderList);
$('#mob-list').on('click', '.del', function () {
    const id = Number(this.dataset.id);
    customMobs = customMobs.filter(m => m.id !== id);
    saveCustom();
    renderList();
});
$('#mob-list').on('click', '.list-row', function () {
    $(this).toggleClass('row-active');
});
loadMobs();