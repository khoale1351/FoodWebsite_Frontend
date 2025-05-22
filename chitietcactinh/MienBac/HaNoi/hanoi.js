document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:5151/api/Specialties?provinceId=1')
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('specialties-list');
            
            if (Array.isArray(data)) {
                // Bước 1: Lọc theo provinceId
                const filteredData = data.filter(item => item.provinceId === 1);
                
                // Bước 2: Loại bỏ các mục trùng lặp bằng cách kiểm tra ID
                const uniqueData = filteredData.reduce((acc, current) => {
                    if (!acc.find(item => item.id === current.id)) {
                        acc.push(current);
                    }
                    return acc;
                }, []);
                
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