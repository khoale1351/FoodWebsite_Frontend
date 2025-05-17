// /Home/script.js
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    // Hiệu ứng cho bản đồ
    const areas = document.querySelectorAll('area');
    fetch('https://localhost:5151/api/Provinces', {
        headers: {
            'Authorization': `Bearer ${token || ''}`
        }
    })
    .then(response => response.json())
    .then(provinces => {
        areas.forEach(area => {
            const provinceId = area.getAttribute('href').split('/').pop().replace('.html', '');
            const province = provinces.find(p => p.id.toLowerCase() === provinceId);
            if (province) {
                area.setAttribute('title', province.name);
                area.setAttribute('data-tooltip', province.name);
            }

            // Hiệu ứng khi hover
            area.addEventListener('mouseover', function(e) {
                const provinceName = this.getAttribute('title');
                console.log(`Chuẩn bị khám phá ẩm thực ${provinceName}`);

                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = `Khám phá ẩm thực ${provinceName}`;
                tooltip.style.position = 'absolute';
                tooltip.style.background = '#2E8B57';
                tooltip.style.color = 'white';
                tooltip.style.padding = '5px 10px';
                tooltip.style.borderRadius = '5px';
                document.body.appendChild(tooltip);

                area.addEventListener('mousemove', e => {
                    tooltip.style.left = e.pageX + 10 + 'px';
                    tooltip.style.top = e.pageY + 10 + 'px';
                });

                area.addEventListener('mouseout', () => tooltip.remove());
            });

            // Hiệu ứng focus/blur cho accessibility
            area.addEventListener('focus', function() {
                this.style.outline = '2px solid #f39c12';
            });

            area.addEventListener('blur', function() {
                this.style.outline = 'none';
            });
        });
    });

    // Hiệu ứng cho thanh tìm kiếm
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('focus', function() {
        this.parentElement.style.boxShadow = '0 0 0 2px #f39c12';
    });

    searchInput.addEventListener('blur', function() {
        this.parentElement.style.boxShadow = 'none';
    });

    // Tìm kiếm động với API
    let specialties = [];
    fetch('https://localhost:5151/api/Specialties', {
        headers: {
            'Authorization': `Bearer ${token || ''}`
        }
    })
    .then(response => response.json())
    .then(data => {
        specialties = data.map(item => ({
            name: item.name,
            province: item.tinhThanhId,
            url: `/chitietcactinh/${item.tinhThanhId}.html`,
            description: item.description,
            images: item.images
        }));

        // Xử lý tìm kiếm
        document.querySelector('.search-bar form').addEventListener('submit', function(e) {
            e.preventDefault();
            const query = document.querySelector('.search-bar input').value.toLowerCase();
            const results = specialties.filter(item => item.name.toLowerCase().includes(query));

            // Hiển thị kết quả tìm kiếm
            const resultsContainer = document.createElement('div');
            resultsContainer.className = 'search-results';
            resultsContainer.innerHTML = results.length > 0
                ? results.map(item => `
                    <div class="search-item">
                        <img src="${item.images?.[0] || '/images/placeholder.jpg'}" alt="${item.name}" style="width: 50px; border-radius: 5px;">
                        <div>
                            <h3>${item.name}</h3>
                            <p>${item.description}</p>
                            <a href="${item.url}">Xem chi tiết</a>
                        </div>
                    </div>
                `).join('')
                : '<p>Không tìm thấy kết quả</p>';
            const oldResults = document.querySelector('.search-results');
            if (oldResults) oldResults.remove();
            document.querySelector('.search-bar').after(resultsContainer);
        });
    });

    // Tải top 3 món đặc sản (giả lập lượt tìm kiếm)
    fetch('https://localhost:5151/api/Specialties', {
        headers: {
            'Authorization': `Bearer ${token || ''}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const list = document.getElementById('top-searches-list');
        list.innerHTML = '';
        if (data && data.length > 0) {
            // Giả lập lượt tìm kiếm (API không có search_count)
            const topData = data.slice(0, 3).map(item => ({
                dish_name: item.name,
                search_count: Math.floor(Math.random() * 100) + 50, // Giả lập số lượt
                url: `/chitietcactinh/${item.tinhThanhId}.html`
            }));
            topData.forEach(item => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = item.url;
                a.textContent = `${item.dish_name} - ${item.search_count} lượt tìm kiếm`;
                a.style.color = 'inherit';
                a.style.textDecoration = 'none';
                li.appendChild(a);
                list.appendChild(li);
            });
        } else {
            list.innerHTML = '<li>Không có dữ liệu</li>';
        }
    })
    .catch(error => {
        console.error('Lỗi khi tải dữ liệu:', error);
        document.getElementById('top-searches-list').innerHTML = '<li>Lỗi khi tải dữ liệu</li>';
    });

    // Hiệu ứng cuộn mượt cho các liên kết nội bộ
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

function applyFilter() {
    const region = document.querySelector('select[name="region"]').value;
    const type = document.querySelector('select[name="type"]').value;

    fetch('https://localhost:5151/api/Specialties', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
    })
    .then(response => response.json())
    .then(data => {
        // Lọc phía client
        let filteredData = data;
        if (region) {
            filteredData = filteredData.filter(item => {
                return fetch(`https://localhost:5151/api/Provinces/${item.tinhThanhId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                    }
                })
                .then(res => res.json())
                .then(tinh => tinh.region === region);
            });
        }
        if (type) {
            filteredData = filteredData.filter(item => item.type === type);
        }

        Promise.all(filteredData).then(results => {
            const resultsContainer = document.createElement('div');
            resultsContainer.className = 'filter-results';
            resultsContainer.innerHTML = results.map(item => `
                <div class="specialty-item">
                    <img src="${item.images?.[0] || '/images/placeholder.jpg'}" alt="${item.name}" style="width: 100%; border-radius: 5px;">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <a href="/chitietcactinh/${item.tinhThanhId}.html">Xem chi tiết</a>
                </div>
            `).join('');
            const oldResults = document.querySelector('.filter-results');
            if (oldResults) oldResults.remove();
            document.querySelector('.map-container').after(resultsContainer);
        });
    })
    .catch(error => console.error('Lỗi khi lọc:', error));
}
// Lưu lịch sử xem khi người dùng truy cập món đặc sản
document.addEventListener('DOMContentLoaded', () => {
    const foodItems = document.querySelectorAll('.food-item');
    foodItems.forEach(item => {
        const dacSan = {
            id: item.getAttribute('data-id'),
            name: item.querySelector('h2').textContent,
            description: item.querySelector('p').textContent,
            image: item.querySelector('img').src,
            tinhThanhId: 'hanoi'
        };
        saveToHistory(dacSan);
    });

    // Gửi yêu cầu GET đến backend API
fetch('https://localhost:5151') // <-- chỉnh lại endpoint theo backend của bạn
  .then(response => {
    if (!response.ok) throw new Error("Lỗi khi gọi API");
    return response.json();
  })
  .then(data => {
    document.getElementById("result").innerText = JSON.stringify(data);
  })
  .catch(error => {
    console.error("Lỗi:", error);
    document.getElementById("result").innerText = "Không thể gọi API.";
  });

});