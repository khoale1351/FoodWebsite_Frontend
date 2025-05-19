document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const foodId = urlParams.get('foodId');

    console.log('foodId:', foodId);

    const foodTitle = document.getElementById('food-title');
    const foodImage = document.getElementById('food-image');
    const foodDescription = document.getElementById('food-description');

    if (!foodId) {
        if (foodTitle) foodTitle.textContent = 'Không tìm thấy món ăn';
        return;
    }

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
            if (foodTitle) foodTitle.textContent = food.name;
            if (foodImage) {
                foodImage.src = food.specialtyImages?.[0]?.imageUrl || '/images/placeholder.jpg';
                foodImage.alt = food.name;
            }
            if (foodDescription) foodDescription.textContent = food.description || 'Không có mô tả';
        })
        .catch(error => {
            console.error('Error fetching food details:', error);
            if (foodTitle) foodTitle.textContent = 'Không tìm thấy món ăn';
        });
});