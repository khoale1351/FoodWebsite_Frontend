// Hàm xóa dấu tiếng Việt
function removeDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Lấy query từ URL
const urlParams = new URLSearchParams(window.location.search);
const rawQuery = urlParams.get('query') || '';
const query = removeDiacritics(rawQuery);

// Hiển thị từ khóa tìm kiếm
document.getElementById('search-query').textContent = rawQuery;

// Tìm kiếm và hiển thị kết quả
if (query) {
    fetch('http://localhost:5151/api/Specialties', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Không lấy được dữ liệu đặc sản!');
            }
            return response.json();
        })
        .then(data => {
            const searchList = document.getElementById('search-list');

            // Lọc dữ liệu
            const filtered = data.filter(item => {
                const namePlain = removeDiacritics(item.name);

                // Nếu chỉ gõ 1 chữ: tìm các món bắt đầu bằng chữ đó
                if (query.length === 1) {
                    return namePlain.startsWith(query);
                }

                // Nếu gõ nhiều chữ: tìm chứa hoặc khớp chính xác
                return namePlain === query || namePlain.includes(query);
            });

            if (filtered.length === 0) {
                searchList.innerHTML = '<p>Không tìm thấy đặc sản nào!</p>';
                return;
            }

            searchList.innerHTML = filtered.map(item => `
                <div class="search-item">
                    <img src="${item.image || 'default-image.jpg'}" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <a href="/chitietcactinh/${item.tinhThanhId}.html">Xem chi tiết</a>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Lỗi khi tìm kiếm:', error);
            document.getElementById('search-list').innerHTML = '<p>Không tìm thấy!</p>';
        });
} else {
    document.getElementById('search-list').innerHTML = '<p>Vui lòng nhập từ khóa tìm kiếm!</p>';
}

// Xử lý tìm kiếm mới từ form
document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newQuery = document.getElementById('search-input').value.trim();
    if (newQuery) {
        window.location.href = `/HTML/Tim kiem/search.html?query=${encodeURIComponent(newQuery)}`;
    }
});