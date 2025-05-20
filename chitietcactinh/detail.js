document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        const foodTitle = document.getElementById('food-title');
        if (foodTitle) foodTitle.textContent = 'Không tìm thấy món ăn';
        return;
    }

    fetch(`http://localhost:5151/api/Specialties/${id}`)
        .then(res => {
            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(`Lỗi ${res.status}: ${res.statusText} - ${text}`);
                });
            }
            return res.json();
        })
        .then(data => {
            document.getElementById('specialty-detail').innerHTML = `
                <h2>${data.name}</h2>
                <img src="${data.imageUrl}" alt="${data.name}">
                <p>${data.description}</p>
            `;

            // Lưu lịch sử nếu đã đăng nhập
            const token = localStorage.getItem('token');
            if (token) {
                fetch('http://localhost:5151/api/UserHistory', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        specialtyId: data.id,
                        name: data.name,
                        image: data.imageUrl,
                        description: data.description,
                        provinceId: data.provinceId
                    })
                });
            }
        })
        .catch(error => {
            console.error('Error fetching food details:', error);
            const foodTitle = document.getElementById('food-title');
            if (foodTitle) foodTitle.textContent = 'Không tìm thấy món ăn';
        });
});