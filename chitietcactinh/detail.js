// /chitietcactinh/detail.js
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const foodId = urlParams.get('foodId');

    // Gọi API để lấy chi tiết món ăn
    fetch(`http://localhost:5151/api/food/${foodId}`)
        .then(response => response.json())
        .then(food => {
            if (food.error) throw new Error(food.error);
            document.getElementById('food-title').textContent = food.title;
            document.getElementById('food-image').src = food.image_url;
            document.getElementById('food-image').alt = food.title;
            document.getElementById('food-description').textContent = food.description;
        })
        .catch(error => {
            console.error('Error fetching food details:', error);
            document.getElementById('food-title').textContent = 'Không tìm thấy món ăn';
        });
});
