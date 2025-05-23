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

            const gridHtml = filtered.length
                ? `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    ${filtered.map(item => `
                        <div class="search-item bg-white rounded-lg shadow p-4 flex flex-col items-center">
                            <img src="${item.image || '/IMAGES/no-image.png'}" alt="${item.name}" class="w-40 h-40 object-cover rounded mb-3">
                            <h3 class="text-lg font-semibold mb-1 text-center">${item.name}</h3>
                            <p class="text-gray-600 text-sm mb-3 text-center">${item.description || ''}</p>
                            <a href="/HTML/chi tiet mon an/detail.html?id=${item.id}" class="px-4 py-2 bg-gradient-to-r from-pink-500 to-green-400 text-white rounded font-semibold hover:opacity-90 transition">Xem chi tiết</a>
                        </div>
                    `).join('')}
                  </div>`
                : '<p>Không tìm thấy đặc sản nào!</p>';

            searchList.innerHTML = gridHtml;
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