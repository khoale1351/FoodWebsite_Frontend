document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:5151/api/Specialties?provinceId=5')
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('specialties-list');
            
            if (Array.isArray(data)) {
                // Bước 1: Lọc theo provinceId (có thể bỏ nếu API đã filter)
                const filteredData = data.filter(item => item.provinceId === 5);
                
                // Bước 2: Loại bỏ các mục trùng lặp bằng tên
                const seenNames = new Set();
                const uniqueData = filteredData.filter(item => {
                    if (seenNames.has(item.name)) return false;
                    seenNames.add(item.name);
                    return true;
                });
                
                // Render kết quả
                list.innerHTML = uniqueData.map(item => `
                    <div class="specialty-item">
                        <a href="/chitietmonan/detail.html?id=${item.id}">
                            <img src="${item.imageUrl}" alt="${item.name}">
                            <h3>${item.name}</h3>
                        </a>
                    </div>
                `).join('');
                
                if (uniqueData.length === 0) {
                    list.innerHTML = '<p>Không có đặc sản cho tỉnh này!</p>';
                }
            } else {
                list.innerHTML = '<p>Không có dữ liệu đặc sản!</p>';
            }
        })
        .catch(() => {
            document.getElementById('specialties-list').innerHTML = '<p>Lỗi tải dữ liệu!</p>';
        });
});