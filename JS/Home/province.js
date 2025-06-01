document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5151/api';

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
            const response = await fetchAPI('/Provinces');
            console.log('API /Provinces trả về:', response);

            // Nếu response là object có thuộc tính 'data' là array
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

    const regionFilter = document.getElementById("region-filter");
    const provinceFilter = document.getElementById("province-filter");
    const specialtiesDiv = document.getElementById("province-specialties");

    let provinces = [];

    // Chỉ chạy filter nếu có đủ phần tử
    if (regionFilter && provinceFilter && specialtiesDiv) {
        // Lấy danh sách tỉnh
        async function fetchProvinces() {
            const res = await fetch("http://localhost:5151/api/Provinces");
            provinces = await res.json();
        }

        // Lấy danh sách món ăn theo tỉnh
        async function fetchSpecialtiesByProvince(provinceId) {
            specialtiesDiv.innerHTML = "Đang tải...";
            const res = await fetch(`http://localhost:5151/api/Specialties?provinceId=${provinceId}`);
            const data = await res.json();
            if (!data || data.length === 0) {
                specialtiesDiv.innerHTML = "<p>Không có đặc sản nào cho tỉnh này.</p>";
                return;
            }
            specialtiesDiv.innerHTML = data.map(s => `
      <div class="specialty-item p-4 border rounded bg-white shadow">
        <img src="${s.imageUrls?.[0] || '/IMAGES/no-image.png'}" alt="${s.name}" class="mb-2 w-full h-40 object-cover rounded">
        <h3 class="font-bold">${s.name}</h3>
        <p class="text-sm">${s.description || ""}</p>
      </div>
    `).join("");
        }

        // Khi chọn miền
        regionFilter.addEventListener("change", () => {
            const region = regionFilter.value;
            provinceFilter.innerHTML = `<option value="">Chọn tỉnh/thành</option>`;
            provinceFilter.disabled = !region;
            specialtiesDiv.innerHTML = "";
            if (region) {
                const filtered = provinces.filter(p => p.region === region);
                filtered.forEach(p => {
                    provinceFilter.innerHTML += `<option value="${p.id}">${p.name}</option>`;
                });
            }
        });

        // Hàm tạo slug từ tên tỉnh (không dấu, viết liền, thường dùng cho URL)
        function toSlug(str) {
            return str
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d")
                .replace(/Đ/g, "D")
                .replace(/\s+/g, "")
                .toLowerCase();
        }

        // Khi chọn tỉnh
        provinceFilter.addEventListener("change", () => {
            const provinceId = provinceFilter.value;
            if (provinceId) {
                // Lấy tên tỉnh từ danh sách đã fetch
                const province = provinces.find(p => String(p.id) === provinceId);
                if (province) {
                    const slug = toSlug(province.name);
                    // Chuyển hướng sang trang chi tiết tỉnh thành, truyền slug qua URL
                    window.location.href = `/HTML/chi tiet tinh thanh/tinhthanh.html?province=${slug}`;
                }
            }
        });

        // Khởi tạo
        fetchProvinces();
    }

    // Luôn chạy initMapProvinces vì trang nào cũng có thể có bản đồ
    initMapProvinces();
});