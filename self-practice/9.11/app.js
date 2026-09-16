const form = document.querySelector('#add-form');
const titleInput = document.querySelector('#title-input');
const authorInput = document.querySelector('#author-input');
const ratingInput = document.querySelector('#rating-input');
const tip = document.querySelector('#tip');
const list = document.querySelector('#book-list');
const searchInput = document.querySelector('#search-input');
let books = JSON.parse(localStorage.getItem('books') || '[]');
let keyword = '';
const save = () => localStorage.setItem('books', JSON.stringify(books));
const render = () => {
    list.innerHTML = '';
    const shown = books.filter(b => b.title.includes(keyword));
    if (shown.length === 0) {
        const li = document.createElement('li');
        li.textContent = keyword ? '没有匹配的书' : '暂无书籍';
        list.appendChild(li);
        return;
    }
    shown.forEach(book => {
        const li = document.createElement('li');
        const info = document.createElement('span');
        info.textContent = `${book.title} — ${book.author} — ${'*'.repeat(book.rating)}`;
        const del = document.createElement('span');
        del.textContent = '删除';
        del.className = 'del';
        del.dataset.id = book.id;
        li.appendChild(info);
        li.appendChild(del);
        list.appendChild(li);
    });
};
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    if (title === '' || author === '') {
        tip.textContent = '书名和作者不能为空';
        return;
    }
    books.push({
        id: Date.now(), 
        title: title,
        author: author,
        rating: Number(ratingInput.value)
    });
    tip.textContent = '';
    titleInput.value = '';
    authorInput.value = '';
    save();
    render();
});
list.addEventListener('click', (e) => {
    if (e.target.classList.contains('del')) {
        const id = Number(e.target.dataset.id);
        books = books.filter(b => b.id !== id);
        save();
        render();
    }
});
searchInput.addEventListener('input', (e) => {
    keyword = e.target.value.trim();
    render();
});
document.querySelector('#export-btn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(books, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'books.json';
    a.click();
    URL.revokeObjectURL(url);
});
render();