document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:7177/api';

    async function fetchAPI(endpoint) {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log('Gọi API:', url);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
            }
            const text = await response.text(); // Kiểm tra phản hồi
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
            const provinces = await fetchAPI('/Provinces');
            const areas = document.querySelectorAll('area');

            areas.forEach(area => {
                const provinceId = area.getAttribute('href')?.split('/').pop()?.replace('.html', '');
                const province = provinces.find(p => p.id != null && String(p.id) === provinceId);

                if (province) {
                    area.setAttribute('title', province.name);
                    area.setAttribute('data-tooltip', province.name);
                }

                area.addEventListener('mouseover', function (e) {
                    const provinceName = this.getAttribute('title') || 'Không xác định';
                    const tooltip = document.createElement('div');
                    tooltip.className = 'tooltip';
                    tooltip.textContent = `Khám phá ẩm thực ${provinceName}`;
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

                area.addEventListener('focus', function () {
                    this.style.outline = '2px solid var(--accent-color)';
                });
                area.addEventListener('blur', function () {
                    this.style.outline = 'none';
                });
            });
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu tỉnh:', error.message);
            alert('Không thể tải dữ liệu tỉnh. Vui lòng thử lại sau.');
        }
    }

    initMapProvinces();
});