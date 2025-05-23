document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5151/api';

    async function fetchAPI(endpoint, options = {}, needToken = false) {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log('Gọi API:', url);
        const headers = options.headers || {};
        if (needToken) {
            const token = localStorage.getItem('token');
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }
        try {
            const fetchOptions = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                ...(options.body && { body: JSON.stringify(options.body) })
            };
            const response = await fetch(url, fetchOptions);
            if (!response.ok) {
                throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
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

    async function initMapProvinces() {
        try {
            const response = await fetchAPI('/Provinces');
            console.log('API /Provinces trả về:', response);

            // Xử lý response linh hoạt
            let provinces;
            if (Array.isArray(response)) {
                provinces = response;
            } else if (Array.isArray(response.data)) {
                provinces = response.data;
            } else {
                provinces = Object.values(response);
            }
            console.log('provinces:', provinces);

            const areas = document.querySelectorAll('area');
            let activeTooltip = null;

            areas.forEach(area => {
                // Lấy provinceId từ href hoặc dataset
                const provinceId = area.getAttribute('href')?.split('/').pop()?.replace('.html', '') || area.dataset.id;
                const province = provinces.find(p => p.id != null && String(p.id) === provinceId);

                if (province) {
                    area.setAttribute('title', province.name);
                    area.setAttribute('data-tooltip', province.name);
                    area.setAttribute('data-id', province.id); // Lưu provinceId
                }

                // Tooltip động
                area.addEventListener('mouseover', function (e) {
                    if (activeTooltip) {
                        activeTooltip.remove(); // Xóa tooltip cũ để tránh chồng lấn
                    }
                    const provinceName = this.getAttribute('title') || 'Không xác định';
                    const tooltip = document.createElement('div');
                    tooltip.className = 'tooltip';
                    tooltip.textContent = `Khám phá ẩm thực ${provinceName}`;
                    tooltip.setAttribute('role', 'tooltip'); // Khả năng tiếp cận
                    tooltip.style.position = 'absolute';
                    tooltip.style.background = 'var(--primary-color)';
                    tooltip.style.color = '#fff';
                    tooltip.style.padding = '8px 12px';
                    tooltip.style.borderRadius = '5px';
                    tooltip.style.fontSize = '16px'; // Tăng kích thước cho máy tính
                    document.body.appendChild(tooltip);
                    activeTooltip = tooltip;

                    area.addEventListener('mousemove', e => {
                        tooltip.style.left = `${e.pageX + 15}px`;
                        tooltip.style.top = `${e.pageY + 15}px`;
                    });
                });

                area.addEventListener('mouseout', () => {
                    if (activeTooltip) {
                        activeTooltip.remove();
                        activeTooltip = null;
                    }
                });

                // Khả năng tiếp cận
                area.addEventListener('focus', function () {
                    this.style.outline = '2px solid var(--accent-color)';
                });
                area.addEventListener('blur', function () {
                    this.style.outline = 'none';
                });
            });
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu tỉnh:', error.message);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-red-500 text-center p-4';
            errorDiv.textContent = 'Không thể tải dữ liệu tỉnh. Vui lòng thử lại sau.';
            document.querySelector('main')?.appendChild(errorDiv);
        }
    }

    initMapProvinces();
});