async function fetchAPI(endpoint, options = {}, needToken = false) {
    const url = endpoint.startsWith('http') ? endpoint : `http://localhost:5151${endpoint}`;
    const headers = options.headers || {};
    if (needToken) {
        const token = localStorage.getItem('token');
        if (token) headers['Authorization'] = 'Bearer ' + token;
    }
    let fetchOptions = {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };
    if (options.body) fetchOptions.body = JSON.stringify(options.body);
    const res = await fetch(url, fetchOptions);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

function getValidImageUrl(url) {
    if (!url || typeof url !== 'string' || (!url.startsWith('http') && !url.startsWith('/'))) {
        return '/IMAGES/no-image.png'; // Đặt 1 ảnh mặc định trong thư mục IMAGES
    }
    return url;
}

// Hàm lấy món ăn nổi bật (ví dụ: lấy 6 món đầu tiên)
async function fetchFeaturedRecipes() {
    const el = document.getElementById('featured-recipes');
    el.innerHTML = '';
    try {
        const specialties = await fetchAPI('/api/Specialties', {}, false);
        specialties.slice(0, 6).forEach(s => {
            const div = document.createElement('div');
            div.className = 'specialty-item p-4 border rounded bg-white shadow';
            div.innerHTML = `
                <img src="${getValidImageUrl(s.specialtyImages?.[0]?.imageUrl)}" alt="${s.name}" class="mb-2 w-full h-40 object-cover rounded">
                <h3 class="font-bold">${s.name}</h3>
                <p class="text-sm">${s.description || ''}</p>
            `;
            el.appendChild(div);
        });
    } catch (err) {
        el.innerHTML = '<p class="text-red-500">Không thể tải dữ liệu.</p>';
    }
}

// Hàm lấy top 5 món được xem nhiều nhất
async function fetchTopRecipes() {
    const el = document.getElementById('top-recipes-list');
    el.innerHTML = '';
    try {
        const data = await fetchAPI('/api/UserViewHistory/top-recipes?top=5', {}, true);
        if (!data || data.length === 0) {
            el.innerHTML = '<li>Chưa có dữ liệu.</li>';
            return;
        }
        data.forEach((name, idx) => {
            const li = document.createElement('li');
            li.textContent = `${idx + 1}. ${name}`;
            el.appendChild(li);
        });
    } catch (err) {
        el.innerHTML = '<li class="text-red-500">Không thể tải dữ liệu.</li>';
    }
}

// Hàm lấy đánh giá từ người dùng
async function fetchTestimonials() {
    const el = document.getElementById('testimonial-list');
    el.innerHTML = '';
    try {
        const data = await fetchAPI('/api/Ratings', {}, true);
        if (!data || data.length === 0) {
            el.innerHTML = '<p>Chưa có đánh giá nào.</p>';
            return;
        }
        data.slice(-5).reverse().forEach(rating => {
            const div = document.createElement('div');
            div.className = 'testimonial-item p-2 border-b';
            div.innerHTML = `
                <p>${rating.comment || 'Không có bình luận'}</p>
                <p class="text-sm text-gray-500">${rating.user?.fullName || rating.userId || 'Ẩn danh'} - ${rating.stars || 0} sao</p>
            `;
            el.appendChild(div);
        });
    } catch (err) {
        el.innerHTML = '<p class="text-red-500">Không thể tải dữ liệu.</p>';
    }
}

// Gọi các hàm khi trang load
document.addEventListener('DOMContentLoaded', () => {
    fetchFeaturedRecipes();
    fetchTopRecipes();
    fetchTestimonials();
});