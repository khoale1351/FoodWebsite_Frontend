const provinceId = 'laocai';
const API_BASE_URL = 'http://localhost:5151/api';

// Hàm gọi API với xử lý lỗi
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token || ''}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        if (!response.ok) {
            throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Lỗi khi gọi API ${endpoint}:`, error);
        throw error;
    }
}

// Tải thông tin tỉnh và đặc sản
async function loadProvince() {
    try {
        // Lấy thông tin tỉnh
        const province = await fetchAPI(`/TinhThanh/${provinceId}`);
        document.getElementById('province-name').textContent = province.name;

        // Lấy danh sách đặc sản
        const specialties = await fetchAPI(`/DacSan?tinhThanhId=${provinceId}`);
        const specialtiesList = document.getElementById('specialties-list');
        specialtiesList.innerHTML = specialties.length > 0
            ? specialties.map(item => `
                        <div class="food-item" data-id="${item.id}">
                            <img src="${item.specialtyImages?.[0]?.imageUrl || '/images/placeholder.jpg'}" alt="${item.name}">
                            <h2>${item.name}</h2>
                            <p>${item.description || 'Không có mô tả'}</p>
                        </div>
                    `).join('')
            : '<p>Chưa có đặc sản</p>';

        // Lưu lịch sử xem khi nhấp vào đặc sản
        document.querySelectorAll('.food-item').forEach(item => {
            item.addEventListener('click', () => {
                const dacSan = {
                    id: item.getAttribute('data-id'),
                    name: item.querySelector('h2').textContent,
                    description: item.querySelector('p').textContent,
                    image: item.querySelector('img').src,
                    tinhThanhId: provinceId,
                };
                saveToHistory(dacSan); // Hàm từ index.js
            });
        });
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        document.getElementById('specialties-list').innerHTML = '<p>Lỗi khi tải đặc sản</p>';
    }
}

// Tìm kiếm đặc sản
document.getElementById('search-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.querySelector('#search-form input[name="query"]').value.toLowerCase();
    try {
        const specialties = await fetchAPI('/DacSan');
        const results = specialties.filter(item => item.name.toLowerCase().includes(query));

        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        resultsContainer.innerHTML = results.length > 0
            ? results.map(item => `
                        <div class="search-item">
                            <img src="${item.specialtyImages?.[0]?.imageUrl || '/images/placeholder.jpg'}" alt="${item.name}" style="width: 50px; border-radius: 5px;">
                            <div>
                                <h3>${item.name}</h3>
                                <p>${item.description || 'Không có mô tả'}</p>
                                <a href="/chitietcactinh/${item.tinhThanhId}.html" onclick="saveToHistory({ id: '${item.id}', name: '${item.name}', description: '${item.description || ''}', image: '${item.specialtyImages?.[0]?.imageUrl || ''}', tinhThanhId: '${item.tinhThanhId}' })">Xem chi tiết</a>
                            </div>
                        </div>
                    `).join('')
            : '<p>Không tìm thấy kết quả</p>';

        const oldResults = document.querySelector('.search-results');
        if (oldResults) oldResults.remove();
        document.querySelector('.detail-container').after(resultsContainer);
    } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
        alert('Lỗi khi tìm kiếm đặc sản');
    }
});

// Thêm sự kiện cho nút (nếu có nhiều nút, đặt tên khác nhau)
const tenPhanTuBtn = document.getElementById('tenPhanTu');
if (tenPhanTuBtn) {
    tenPhanTuBtn.addEventListener('click', function () {
        // ...code...
    });
}

const myButton = document.getElementById('myButton');
if (myButton) {
    myButton.addEventListener('click', function() {
        // ...
    });
}

// Khởi tạo
loadProvince();
loadTopSpecialties(); // Hàm từ index.js

document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:5151/api/Specialties?provinceId=2') // 2 là id của Lào Cai, sửa lại đúng id nếu cần
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('specialties-list');
            if (Array.isArray(data)) {
                list.innerHTML = data.map(item => `
                    <div class="specialty-item">
                        <a href="/chitietmonan/detail.html?id=${item.id}">
                            <img src="${item.imageUrl}" alt="${item.name}">
                            <h3>${item.name}</h3>
                        </a>
                    </div>
                `).join('');
            } else {
                list.innerHTML = '<p>Không có dữ liệu đặc sản!</p>';
            }
        })
        .catch(() => {
            const list = document.getElementById('specialties-list');
            if (list) list.innerHTML = '<p>Lỗi tải dữ liệu!</p>';
        });
});