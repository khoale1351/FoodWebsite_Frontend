document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "http://localhost:5151/api";
  const BACKEND_BASE_URL = "http://localhost:5151";

  async function fetchAPI(endpoint, options = {}, needToken = false) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = options.headers || {};
    if (needToken) {
      const token = localStorage.getItem("token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const fetchOptions = {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        ...(options.body && { body: JSON.stringify(options.body) }),
      };
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
      }
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (error) {
      console.error(`Lỗi khi gọi API ${endpoint}:`, error.message);
      throw error;
    }
  }

  function getValidImageUrl(url) {
    if (!url || typeof url !== "string") return "/IMAGES/no-image.png";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return BACKEND_BASE_URL + url;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const specialtyId = urlParams.get("id");

  if (specialtyId) {
    fetchAPI(`/Specialties/${specialtyId}/detail`)
      .then((data) => {
        const detail = document.getElementById("specialty-detail");
        const imageUrl = getValidImageUrl(data.imageUrls?.[0]);

        detail.innerHTML = `
          <h2 class="text-2xl font-bold">${data.name}</h2>
          <img src="${imageUrl}" alt="${
          data.name
        }" class="w-full h-64 object-cover rounded mt-2">
          <p class="mt-4">${data.description || "Không có mô tả"}</p>
          <p class="mt-2 text-gray-600">Thuộc tỉnh: ${
            data.provinceName || "Không rõ"
          }</p>
        `;

        const recipesContainer = document.getElementById("recipes-container");
        if (data.recipes && data.recipes.length > 0) {
          data.recipes.forEach((recipe) => {
            const recipeCard = document.createElement("div");
            recipeCard.className = "p-4 border rounded shadow-sm bg-white";
            recipeCard.innerHTML = `
              <h4 class="font-semibold text-lg">${recipe.name}</h4>
              <p><strong>Thời gian chuẩn bị:</strong> ${
                recipe.prepareTime || 0
              } phút</p>
              <p><strong>Thời gian nấu:</strong> ${
                recipe.cookingTime || 0
              } phút</p>
              <p>${recipe.description || "Không có mô tả"}</p>
              <p class="text-sm text-gray-500">Lượt yêu thích: ${
                recipe.favoriteCount
              } - Lượt xem: ${recipe.viewCount}</p>
            `;
            recipesContainer.appendChild(recipeCard);
          });
        } else {
          document.getElementById("recipe-list").style.display = "none";
        }

        const token = localStorage.getItem("token");
        if (token) {
          fetchAPI(
            "/UserViewHistory",
            {
              method: "POST",
              body: { specialtyId: parseInt(specialtyId), recipeId: null },
            },
            true
          ).catch((error) =>
            console.error("Lỗi khi lưu lịch sử:", error.message)
          );
        }
      })
      .catch((error) => {
        console.error("Lỗi khi tải chi tiết:", error.message);
        document.getElementById(
          "specialty-detail"
        ).innerHTML = `<p>Không tải được chi tiết!<br>${error.message}</p>`;
      });
  } else {
    document.getElementById("specialty-detail").innerHTML =
      "<p>Không tìm thấy món ăn!</p>";
  }
});
