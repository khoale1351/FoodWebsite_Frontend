document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5151/api';
    // Ánh xạ tinhThanhId sang tên tỉnh
    const provinceMap = {
        1: 'hanoi',
        2: 'hcm',
        // Thêm các tỉnh khác
    };

    async function fetchAPI(endpoint) {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log('Gọi API:', url);
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Lỗi ${response.status}: ${response.statusText} - ${text}`);
            }
            const text = await response.text();
            if (!text) {
                throw new Error('Phản hồi API rỗng');
            }
            return JSON.parse(text);
        } catch (error) {
            console.error(`Lỗi khi gọi API ${endpoint}:`, error.message);
            throw error;
        }
    }

    async function getUserId() {
        try {
            const profile = await fetchAPI('/Auth/profile');
            return profile.id || 'user-id'; // Giả định profile trả về id
        } catch (error) {
            console.warn('Không lấy được userId:', error);
            return 'user-id';
        }
    }

    function saveToHistory(dacSan) {
        let history = JSON.parse(localStorage.getItem('viewHistory')) || [];
        if (!history.some(item => item.id === dacSan.id)) {
            history.push(dacSan);
            localStorage.setItem('viewHistory', JSON.stringify(history));
        }
    }

    function clearHistory() {
        localStorage.removeItem('viewHistory');
        loadHistory();
    }

    function loadHistory() {
        const historyList = document.getElementById('history-list');
        let history = JSON.parse(localStorage.getItem('viewHistory')) || [];

        if (!historyList) {
            console.error('Không tìm thấy #history-list');
            return;
        }

        if (history.length === 0) {
            historyList.innerHTML = '<p>Bạn chưa xem món đặc sản nào!</p>';
            return;
        }

        historyList.innerHTML = history.map(item => `
            <div class="history-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="history-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <a href="/chitietcactinh/${provinceMap[item.tinhThanhId] || 'hanoi'}.html?foodId=${item.id}">Xem lại</a>
                </div>
            </div>
        `).join('');
    }

    function saveToServerHistory(dacSanId) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('Chưa đăng nhập, không lưu lịch sử server');
            return;
        }
        getUserId().then(userId => {
            fetch(`${API_BASE_URL}/History`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, dacSanId })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
                    }
                    console.log('Lưu lịch sử server thành công');
                })
                .catch(error => console.error('Lỗi lưu lịch sử server:', error));
        });
    }

    async function loadSpecialties() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const foodId = urlParams.get('foodId') || '1';

            console.log('foodId:', foodId);

            const dacSan = await fetchAPI(`/Specialties/${foodId}`);
            const specialtyData = {
                id: dacSan.id,
                name: dacSan.name,
                description: dacSan.description || 'Không có mô tả',
                image: dacSan.specialtyImages?.[0]?.imageUrl || 'default-image.jpg',
                tinhThanhId: dacSan.tinhThanhId
            };
            saveToHistory(specialtyData);
            saveToServerHistory(dacSan.id);

            const container = document.getElementById('specialties-container');
            if (container) {
                container.innerHTML = `
                    <div class="specialty-item">
                        <h3>${dacSan.name}</h3>
                        <img src="${specialtyData.image}" alt="${dacSan.name}">
                        <p>${specialtyData.description}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Lỗi khi tải đặc sản:', error);
            const container = document.getElementById('specialties-container');
            if (container) {
                container.textContent = 'Không thể tải dữ liệu';
            }
        }
    }

    loadSpecialties();
    loadHistory();
});