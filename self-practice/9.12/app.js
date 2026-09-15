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
  } catch (err) {
    $('#status').text('加载失败：' + err.message).show();
  }
};
loadData();