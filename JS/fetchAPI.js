async function fetchAPI(endpoint, options = {}, needToken = false) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `http://localhost:5151${endpoint}`;
  const headers = options.headers || {};
  if (needToken) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = "Bearer " + token;
  }
  let fetchOptions = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };
  if (options.body) fetchOptions.body = JSON.stringify(options.body);
  const res = await fetch(url, fetchOptions);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function getValidImageUrl(item) {
  const apiBaseUrl = "http://localhost:5151";
  // Ưu tiên trường images (giống search.js)
  if (item.images) {
    return `${apiBaseUrl}${item.images}`;
  }
  // Nếu có trường image
  if (item.image) {
    return `${apiBaseUrl}${item.image}`;
  }
  // Nếu có specialtyImages dạng mảng
  if (item.specialtyImages?.[0]?.imageUrl) {
    return `${apiBaseUrl}${item.specialtyImages[0].imageUrl}`;
  }
  return "/IMAGES/no-image.png";
}

// Hàm lấy món ăn nổi bật (ví dụ: lấy 6 món đầu tiên)
async function fetchFeaturedRecipes() {
  const el = document.getElementById("featured-recipes");
  el.innerHTML = "";
  try {
    const specialties = await fetchAPI("/api/Specialties", {}, false);
    featuredRecipes = specialties.slice(0, 6); // hoặc nhiều hơn nếu muốn
    featuredIndex = 0;
    renderFeaturedRecipes();
  } catch (err) {
    el.innerHTML = '<p class="text-red-500">Không thể tải dữ liệu.</p>';
  }
}

// Hàm lấy top đặc sản nổi bật
async function fetchTopSpecialties() {
  const el = document.getElementById("top-specialties-list");
  el.innerHTML = "";
  try {
    const data = await fetchAPI(
      "/api/statistics/top-specialties?top=10",
      {},
      false
    );
    if (data && data.length && data[0].specialtyId) {
      el.innerHTML = createSpecialtyCarouselHtml(data);
    } else {
      el.innerHTML = "<p>Không có dữ liệu đặc sản nổi bật.</p>";
    }
  } catch (err) {
    console.error(err);
    el.innerHTML = '<p class="text-red-500">Không thể tải dữ liệu đặc sản.</p>';
  }
}

// Hàm lấy đánh giá từ người dùng
async function fetchTestimonials() {
  const el = document.getElementById("testimonial-list");
  el.innerHTML = "";
  try {
    const data = await fetchAPI("/api/Ratings", {}, false);
    if (!data || data.length === 0) {
      el.innerHTML = "<p>Chưa có đánh giá nào.</p>";
      return;
    }
    data
      .slice(-5)
      .reverse()
      .forEach((rating) => {
        const div = document.createElement("div");
        div.className = "testimonial-item p-2 border-b";
        div.innerHTML = `
                <p>${rating.comment || "Không có bình luận"}</p>
                <p class="text-sm text-gray-500">${rating.user?.fullName || rating.userId || "Ẩn danh"
          } - ${rating.stars || 0} sao</p>
            `;
        el.appendChild(div);
      });
  } catch (err) {
    el.innerHTML = '<p class="text-red-500">Không thể tải dữ liệu.</p>';
  }
}

function createSpecialtyCarouselHtml(items) {
  return `
    <div class="overflow-x-auto">
      <div class="flex gap-6 py-4 px-2" style="scroll-snap-type: x mandatory; overflow-x: scroll;">
        ${items
      .map((item) => {
        const imageUrl = getValidImageUrl(item); // ảnh sẽ đúng nếu API có trả đúng trường
        return `
              <div class="min-w-[250px] max-w-xs flex-shrink-0 bg-white rounded-xl shadow-md p-4 text-center scroll-snap-align-start">
                <img src="${imageUrl}" alt="${item.specialtyName}" class="w-full h-40 object-cover rounded-md mb-3">
                <h3 class="font-bold text-lg">${item.specialtyName}</h3>
                <p class="text-sm text-gray-500 mb-2">Lượt xem: ${item.viewCount}</p>
                <a href="/HTML/chi-tiet-mon-an/detail.html?id=${item.specialtyId}"
                  class="px-5 py-2 bg-gradient-to-r from-pink-500 to-green-400 text-white rounded-full font-semibold shadow hover:opacity-90 transition-all duration-150">
                  Xem chi tiết
                </a>
              </div>
            `;
      })
      .join("")}
      </div>
    </div>
  `;
}

function createRecipeCardHtml(items) {
  return `
    <div class="flex flex-wrap justify-center gap-8 py-6">
      ${items
      .map((item) => {
        const imageUrl = getValidImageUrl(item);
        return `
            <div class="search-item bg-white rounded-xl shadow-lg p-5 flex flex-col items-center transition hover:shadow-2xl w-72">
              <img src="${imageUrl}" alt="${item.name}"
                   class="w-40 h-40 object-cover rounded-lg mb-4 border border-gray-200">
              <h3 class="text-lg font-bold mb-2 text-center">${item.name}</h3>
              <p class="text-gray-600 text-sm mb-4 text-center line-clamp-3">${item.description || ""
          }</p>
              <a href="/HTML/chi-tiet-mon-an/detail.html?id=${item.id}"
                 class="px-5 py-2 bg-gradient-to-r from-pink-500 to-green-400 text-white rounded-full font-semibold shadow hover:opacity-90 transition-all duration-150">
                Xem chi tiết
              </a>
            </div>
          `;
      })
      .join("")}
    </div>
  `;
}

function createRecipeCarouselHtml(items) {
  return `
    <div class="overflow-x-auto">
      <div class="flex gap-6 py-4 px-2" style="scroll-snap-type: x mandatory; overflow-x: scroll;">
        ${items
      .map((item) => {
        const imageUrl = getValidImageUrl(item);
        return `
              <div class="min-w-[250px] max-w-xs flex-shrink-0 bg-white rounded-xl shadow-md p-4 text-center scroll-snap-align-start">
                <img src="${imageUrl}" alt="${item.name
          }" class="w-full h-40 object-cover rounded-md mb-3">
                <h3 class="font-bold text-lg">${item.name}</h3>
                <p class="text-sm text-gray-500 mb-2">${item.specialtyName || ""
          }</p>
                <p class="text-sm text-gray-700 line-clamp-3">${item.description || ""
          }</p>
                <a href="/HTML/chi-tiet-mon-an/detail.html?id=${item.id
          }" class="mt-3 inline-block px-4 py-1 bg-pink-500 text-white rounded-full text-sm hover:opacity-90">
                  Xem chi tiết
                </a>
              </div>
            `;
      })
      .join("")}
      </div>
    </div>
  `;
}

// Slideshow cho món ăn nổi bật
let featuredRecipes = [];
let featuredIndex = 0;
const itemsPerSlide = 2; // Đổi thành 3 nếu muốn hiển thị 3 món/lượt

function renderFeaturedRecipes() {
  const container = document.getElementById('featured-recipes');
  container.innerHTML = '';
  if (!featuredRecipes.length) {
    container.innerHTML = '<p>Không có món ăn nổi bật.</p>';
    return;
  }
  for (let i = 0; i < itemsPerSlide; i++) {
    const idx = (featuredIndex + i) % featuredRecipes.length;
    const item = featuredRecipes[idx];
    const imageUrl = getValidImageUrl(item);
    const div = document.createElement('div');
    div.className = 'search-item bg-white rounded-xl shadow-lg p-5 flex flex-col items-center transition hover:shadow-2xl w-72';
    div.innerHTML = `
      <img src="${imageUrl}" alt="${item.name || item.specialtyName}"
           class="w-40 h-40 object-cover rounded-lg mb-4 border border-gray-200">
      <h3 class="text-lg font-bold mb-2 text-center">${item.name || item.specialtyName}</h3>
      <p class="text-gray-600 text-sm mb-4 text-center line-clamp-3">${item.description || ''}</p>
      <a href="/HTML/chi-tiet-mon-an/detail.html?id=${item.id || item.specialtyId}"
         class="px-5 py-2 bg-gradient-to-r from-pink-500 to-green-400 text-white rounded-full font-semibold shadow hover:opacity-90 transition-all duration-150">
        Xem chi tiết
      </a>
    `;
    container.appendChild(div);
  }
}

document.getElementById('featured-prev').onclick = function () {
  featuredIndex = (featuredIndex - itemsPerSlide + featuredRecipes.length) % featuredRecipes.length;
  renderFeaturedRecipes();
};
document.getElementById('featured-next').onclick = function () {
  featuredIndex = (featuredIndex + itemsPerSlide) % featuredRecipes.length;
  renderFeaturedRecipes();
};

// Sau khi lấy dữ liệu featuredRecipes, gọi renderFeaturedRecipes()
// Ví dụ:
featuredRecipes = [
  // { image: '...', name: '...', description: '...', link: '...' },
  // ...
];
renderFeaturedRecipes();

// Gọi các hàm khi trang load
document.addEventListener("DOMContentLoaded", async () => {
  fetchFeaturedRecipes();
  fetchTopSpecialties();

  const token = localStorage.getItem("token");
  if (token) {
    fetchTestimonials();
  } else {
    const testimonialList = document.getElementById("testimonial-list");
    if (testimonialList)
      testimonialList.innerHTML = "<p>Bạn cần đăng nhập để xem đánh giá.</p>";
  }
});
