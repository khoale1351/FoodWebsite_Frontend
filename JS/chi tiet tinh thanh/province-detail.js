document.addEventListener('DOMContentLoaded', () => {
    // Lấy tên tỉnh từ tiêu đề hoặc từ URL (ví dụ: laocai.html => "Lào Cai")
    const provinceMap = {
        laocai: "Lào Cai",
        hanoi: "Hà Nội",
        // ... thêm các tỉnh khác ...
    };
    // Lấy tên file, ví dụ: laocai.html
    const fileName = window.location.pathname.split('/').pop().replace('.html', '');
    const provinceName = provinceMap[fileName.toLowerCase()] || fileName;

    // Gọi API lấy danh sách đặc sản theo tên tỉnh
    fetch(`http://localhost:5151/api/Provinces?search=${encodeURIComponent(provinceName)}`)
        .then(res => res.json())
        .then(provinces => {
            if (!provinces.length) {
                document.getElementById('province-specialties').innerHTML = '<p>Không tìm thấy tỉnh này!</p>';
                return;
            }
            const provinceId = provinces[0].id;
            // Lấy đặc sản theo provinceId
            return fetch(`http://localhost:5151/api/Specialties?provinceId=${provinceId}`);
        })
        .then(res => res && res.json ? res.json() : [])
        .then(data => {
            const container = document.getElementById('province-specialties');
            if (!data || !data.length) {
                container.innerHTML = '<p>Không có món ăn nào cho tỉnh này.</p>';
                return;
            }
            container.innerHTML = `
                <h2 class="text-xl font-bold mb-2">Các món ăn nổi bật của ${provinceName}</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    ${data.map(item => `
                        <div class="search-item bg-white rounded-xl shadow-lg p-5 flex flex-col items-center">
                            <img src="${item.specialtyImages?.[0]?.imageUrl || '/IMAGES/no-image.png'}" alt="${item.name}" class="w-40 h-40 object-cover rounded-lg mb-4 border border-gray-200">
                            <h3 class="text-lg font-bold mb-2 text-center">${item.name}</h3>
                            <p class="text-gray-600 text-sm mb-4 text-center">${item.description || ''}</p>
                            <a href="/HTML/chi tiet mon an/detail.html?id=${item.id}" 
                               class="px-5 py-2 bg-gradient-to-r from-pink-500 to-green-400 text-white rounded-full font-semibold shadow hover:opacity-90 transition-all duration-150">
                               Xem chi tiết
                            </a>
                        </div>
                    `).join('')}
                </div>
            `;
        })
        .catch(() => {
            document.getElementById('province-specialties').innerHTML = '<p>Lỗi khi tải dữ liệu!</p>';
        });
});