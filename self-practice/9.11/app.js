const form = document.querySelector('#add-form');
const titleInput = document.querySelector('#title-input');
const authorInput = document.querySelector('#author-input');
const ratingInput = document.querySelector('#rating-input');
const tip = document.querySelector('#tip');
const list = document.querySelector('#book-list');
let books = [];
const render = () => {
    list.innerHTML = '';
    if (books.length === 0) {
        const li = document.createElement('li');
        li.textContent = '暂无书籍';
        list.appendChild(li);
        return;
    }
    books.forEach(book => {
        const li = document.createElement('li');
        li.textContent = `${book.title} — ${book.author} — ${'*'.repeat(book.rating)}`;
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
    render();
});
render();