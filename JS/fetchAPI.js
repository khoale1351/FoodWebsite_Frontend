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
    el.innerHTML = createRecipeCardHtml(specialties.slice(0, 6));
  } catch (err) {
    el.innerHTML = '<p class="text-red-500">Không thể tải dữ liệu.</p>';
  }
}

// Hàm lấy top 5 món được xem nhiều nhất
async function fetchTopRecipes() {
  const el = document.getElementById("top-recipes-list");
  el.innerHTML = "";
  try {
    const data = await fetchAPI(
      "/api/UserViewHistory/top-recipes?top=5",
      {},
      true
    );
    // Nếu API trả về mảng object món ăn:
    if (data && data.length && data[0].id) {
      el.innerHTML = createRecipeCardHtml(data);
    }
  } catch (err) {
    el.innerHTML = '<li class="text-red-500">Không thể tải dữ liệu.</li>';
  }
}

// Hàm lấy đánh giá từ người dùng
async function fetchTestimonials() {
  const el = document.getElementById("testimonial-list");
  el.innerHTML = "";
  try {
    const data = await fetchAPI("/api/Ratings", {}, true);
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
                <p class="text-sm text-gray-500">${
                  rating.user?.fullName || rating.userId || "Ẩn danh"
                } - ${rating.stars || 0} sao</p>
            `;
        el.appendChild(div);
      });
  } catch (err) {
    el.innerHTML = '<p class="text-red-500">Không thể tải dữ liệu.</p>';
  }
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
              <p class="text-gray-600 text-sm mb-4 text-center line-clamp-3">${item.description || ""}</p>
              <a href="/HTML/chi tiet mon an/detail.html?id=${item.id}"
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

// Gọi các hàm khi trang load
document.addEventListener("DOMContentLoaded", async () => {
  fetchFeaturedRecipes();
  const token = localStorage.getItem("token");
  if (token) {
    fetchTopRecipes();
    fetchTestimonials();
  } else {
    const topList = document.getElementById("top-recipes-list");
    if (topList)
      topList.innerHTML = "<li>Bạn cần đăng nhập để xem top món.</li>";
    const testimonialList = document.getElementById("testimonial-list");
    if (testimonialList)
      testimonialList.innerHTML = "<p>Bạn cần đăng nhập để xem đánh giá.</p>";
  }
});
