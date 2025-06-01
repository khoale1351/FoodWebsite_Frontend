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
    <img src="${imageUrl}" alt="${data.name}">
    <h2>${data.name}</h2>
    <p>${data.description || "Không có mô tả"}</p>
    <p class="text-gray-600">Thuộc tỉnh: ${data.provinceName || "Không rõ"}</p>
  `;

        // Tabs for recipes
        const tabs = document.getElementById("recipe-tabs");
        const content = document.getElementById("recipe-content");

        if (data.recipes && data.recipes.length > 0) {
          data.recipes.forEach((recipe, index) => {
            const button = document.createElement("button");
            button.className = "tab-button";
            button.innerText = recipe.name;
            if (index === 0) button.classList.add("active");
            tabs.appendChild(button);

            button.addEventListener("click", () => {
              document
                .querySelectorAll(".tab-button")
                .forEach((btn) => btn.classList.remove("active"));
              button.classList.add("active");

              content.innerHTML = `
        <h4 style="font-weight:bold;">${recipe.name}</h4>
        <p><strong>Thời gian chuẩn bị:</strong> ${
          recipe.prepareTime || 0
        } phút</p>
        <p><strong>Thời gian nấu:</strong> ${recipe.cookingTime || 0} phút</p>
        <p><strong>Mô tả:</strong> ${recipe.description || "Không có mô tả"}</p>
        <h5 style="margin-top:12px; font-weight:bold;">Nguyên liệu:</h5>
        <ul>
          ${recipe.recipeIngredients
            .map(
              (ing) =>
                `<li>- ${ing.ingredientName}: ${ing.quantity} ${ing.unit}</li>`
            )
            .join("")}
        </ul>
        <h5 style="margin-top:12px; font-weight:bold;">Các bước:</h5>
        <ol>
          ${recipe.recipeSteps
            .map((step) => `<li>${step.description}</li>`)
            .join("")}
        </ol>
      `;
            });

            // Kích hoạt công thức đầu tiên
            if (index === 0) button.click();
          });
        } else {
          content.innerHTML = `<p style="margin-left: 20px; color: #777;">Món ăn hiện chưa có công thức nào.</p>`;
        }

        // Gửi lịch sử
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
