document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const foodId = urlParams.get('foodId');

    console.log('foodId:', foodId); // Log để kiểm tra foodId

    if (!foodId) {
        document.getElementById('food-title').textContent = 'Không tìm thấy món ăn';
        return;
    }

    // Gọi API để lấy chi tiết món ăn
    fetch(`http://localhost:5151/api/Specialties/${foodId}`)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Lỗi ${response.status}: ${response.statusText} - ${text}`);
                });
            }
            return response.json();
        })
        .then(food => {
            document.getElementById('food-title').textContent = food.name;
            document.getElementById('food-image').src = food.specialtyImages?.[0]?.imageUrl || '/images/placeholder.jpg';
            document.getElementById('food-image').alt = food.name;
            document.getElementById('food-description').textContent = food.description || 'Không có mô tả';
        })
        .catch(error => {
            console.error('Error fetching food details:', error);
            document.getElementById('food-title').textContent = 'Không tìm thấy món ăn';
        });
});