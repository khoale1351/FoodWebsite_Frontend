document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname !== '/Home/index.html') {
        console.warn('index.js chỉ chạy trên /Home/index.html');
        return;
    }

    const token = localStorage.getItem('token');
    const API_BASE_URL = 'http://localhost:5151/api';

    async function fetchAPI(endpoint, options = {}, requireAuth = false) {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log('Gọi API:', url);
        try {
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers,
            };
            if (requireAuth) {
                if (!token) {
                    throw new Error('Không có token để truy cập API yêu cầu xác thực');
                }
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(url, {
                ...options,
                headers,
            });
            if (!response.ok) {
                if (response.status === 401 && requireAuth) {
                    localStorage.removeItem('token');
                    alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    window.location.href = '/dangnhap-dangky/dangnhap/login.html';
                }
                throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Lỗi khi gọi API ${endpoint}:`, error.message);
            throw error;
        }
    }

    async function initMap() {
        try {
            const provinces = await fetchAPI('/Provinces', {}, false);
            const areas = document.querySelectorAll('area');

            areas.forEach(area => {
                const provinceId = area.getAttribute('href')?.split('/').pop()?.replace('.html', '');
                const province = provinces.find(p => p.id.toLowerCase() === provinceId);

                if (province) {
                    area.setAttribute('title', province.name);
                    area.setAttribute('data-tooltip', province.name);
                }

                area.addEventListener('mouseover', function(e) {
                    const provinceName = this.getAttribute('title') || 'Không xác định';
                    const tooltip = document.createElement('div');
                    tooltip.className = 'tooltip';
                    tooltip.textContent = `Khám phá ẩm-dan đặc sản ${provinceName}`;
                    tooltip.style.position = 'absolute';
                    tooltip.style.background = 'var(--primary-color)';
                    tooltip.style.color = '#fff';
                    tooltip.style.padding = '5px 10px';
                    tooltip.style.borderRadius = '5px';
                    document.body.appendChild(tooltip);

                    area.addEventListener('mousemove', e => {
                        tooltip.style.left = `${e.pageX + 10}px`;
                        tooltip.style.top = `${e.pageY + 10}px`;
                    });

                    area.addEventListener('mouseout', () => tooltip.remove());
                });

                area.addEventListener('focus', function() {
                    this.style.outline = '2px solid var(--accent-color)';
                });
                area.addEventListener('blur', function() {
                    this.style.outline = 'none';
                });
            });
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu tỉnh:', error.message);
            alert('Không thể tải dữ liệu bản đồ. Vui lòng thử lại sau.');
        }
    }

    async function applyFilter() {
        const region = document.querySelector('select[name="region"]')?.value;
        const type = document.querySelector('select[name="type"]')?.value;

        try {
            const [specialties, provinces] = await Promise.all([
                fetchAPI('/Specialties', {}, false), // Cập nhật thành /Specialties
                fetchAPI('/Provinces', {}, false)
            ]);
            let filteredData = specialties;

            if (region) {
                filteredData = filteredData.filter(item => {
                    const province = provinces.find(p => p.id === item.tinhThanhId);
                    return province && province.region === region;
                });
            }

            if (type) {
                filteredData = filteredData.filter(item => item.type === type);
            }

            const resultsContainer = document.createElement('div');
            resultsContainer.className = 'filter-results';
            resultsContainer.innerHTML = filteredData.length > 0
                ? filteredData.map(item => `
                    <div class="specialty-item">
                        <img src="${item.specialtyImages?.[0]?.imageUrl || '/images/placeholder.jpg'}" alt="${item.name}" style="width: 100%; border-radius: 5px;">
                        <h3>${item.name}</h3>
                        <p>${item.description || 'Không có mô tả'}</p>
                        <a href="/chitietcactinh/${item.tinhThanhId}.html" onclick="saveToHistory({ id: '${item.id}', name: '${item.name}', description: '${item.description || ''}', image: '${item.specialtyImages?.[0]?.imageUrl || ''}', tinhThanhId: '${item.tinhThanhId}' })">Xem chi tiết</a>
                    </div>
                `).join('')
                : '<p>Không tìm thấy kết quả</p>';

            const oldResults = document.querySelector('.filter-results');
            if (oldResults) oldResults.remove();
            document.querySelector('.map-container')?.after(resultsContainer);
        } catch (error) {
            console.error('Lỗi khi lọc đặc sản:', error.message);
            alert('Không thể lọc đặc sản. Vui lòng thử lại sau.');
        }
    }

    function saveToHistory(dacSan) {
        let history = JSON.parse(localStorage.getItem('viewHistory') || '[]');
        history = history.filter(item => item.id !== dacSan.id);
        history.unshift(dacSan);
        if (history.length > 10) history.pop();
        localStorage.setItem('viewHistory', JSON.stringify(history));
    }

    initMap();
    if (document.querySelector('select[name="region"]')) {
        document.querySelector('select[name="region"]').addEventListener('change', applyFilter);
        document.querySelector('select[name="type"]').addEventListener('change', applyFilter);
    }
});