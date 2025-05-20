document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:5151/api/Specialties?provinceId=1')
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
            document.getElementById('specialties-list').innerHTML = '<p>Lỗi tải dữ liệu!</p>';
        });
});