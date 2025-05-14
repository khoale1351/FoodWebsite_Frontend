
        // Lấy tham số query từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('query') || '';

        // Hiển thị từ khóa tìm kiếm
        document.getElementById('search-query').textContent = query;

        // Tìm kiếm và hiển thị kết quả
        if (query) {
            fetch(`http://localhost:5151/api/DacSan?query=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            })
            .then(response => response.json())
            .then(data => {
                const searchList = document.getElementById('search-list');
                if (data.length === 0) {
                    searchList.innerHTML = '<p>Không tìm thấy đặc sản nào!</p>';
                    return;
                }

                searchList.innerHTML = data.map(item => `
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
                document.getElementById('search-list').innerHTML = '<p>Có lỗi xảy ra khi tìm kiếm!</p>';
            });
        } else {
            document.getElementById('search-list').innerHTML = '<p>Vui lòng nhập từ khóa tìm kiếm!</p>';
        }

        // Xử lý tìm kiếm mới từ form
        document.getElementById('search-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const newQuery = document.getElementById('search-input').value.trim();
            if (newQuery) {
                window.location.href = `/search.html?query=${encodeURIComponent(newQuery)}`;
            }
        });
