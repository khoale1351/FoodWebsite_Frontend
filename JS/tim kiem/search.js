// Hàm xóa dấu tiếng Việt
function removeDiacritics(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Lấy và chuẩn hóa query từ URL
function getQueryFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const rawQuery = urlParams.get("query") || "";
  const normalizedQuery = removeDiacritics(rawQuery);
  return { rawQuery, normalizedQuery };
}

// Hiển thị từ khóa tìm kiếm trên UI
function displaySearchQuery(query) {
  const searchQueryEl = document.getElementById("search-query");
  if (searchQueryEl) {
    searchQueryEl.textContent = query;
  }
}

// Tạo HTML cho kết quả tìm kiếm
function createSearchResultHtml(items) {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 py-6">
      ${items
        .map(
          (item) => `
        <div class="search-item bg-white rounded-xl shadow-lg p-5 flex flex-col items-center transition hover:shadow-2xl">
          <img src="${item.image || "/IMAGES/no-image.png"}" alt="${item.name}" 
               class="w-40 h-40 object-cover rounded-lg mb-4 border border-gray-200">
          <h3 class="text-lg font-bold mb-2 text-center">${item.name}</h3>
          <p class="text-gray-600 text-sm mb-4 text-center line-clamp-3">${
            item.description || ""
          }</p>
          <a href="/HTML/chi tiet mon an/detail.html?id=${item.id}" 
             class="px-5 py-2 bg-gradient-to-r from-pink-500 to-green-400 text-white rounded-full font-semibold shadow hover:opacity-90 transition-all duration-150">
            Xem chi tiết
          </a>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

// Hiển thị thông báo rỗng hoặc lỗi
function displayMessage(message, className = "text-gray-500") {
  const searchList = document.getElementById("search-list");
  if (searchList) {
    searchList.innerHTML = `<p class="text-center ${className} py-8">${message}</p>`;
  }
}

// Gọi API tìm kiếm và hiển thị kết quả
async function fetchSearchResults(query) {
  const searchList = document.getElementById("search-list");

  if (!query) {
    displayMessage("Vui lòng nhập từ khóa tìm kiếm!");
    return;
  }

  try {
    const token = localStorage.getItem("token") || "";
    const response = await fetch(
      `http://localhost:5151/api/Specialties/search?query=${encodeURIComponent(
        query
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Không lấy được dữ liệu!");

    const data = await response.json();

    if (!data || data.length === 0) {
      displayMessage("Không tìm thấy đặc sản nào!");
    } else {
      searchList.innerHTML = createSearchResultHtml(data);
    }
  } catch (error) {
    console.error("Lỗi tìm kiếm:", error);
    displayMessage(
      "Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau!",
      "text-red-500"
    );
  }
}

// Bắt sự kiện submit form tìm kiếm
function handleSearchFormSubmit() {
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");

  if (form && input) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const newQuery = input.value.trim();
      if (newQuery) {
        window.location.href = `/HTML/Tim kiem/search.html?query=${encodeURIComponent(
          newQuery
        )}`;
      }
    });
  }
}

// Hàm khởi động khi trang được load
function initSearchPage() {
  const { rawQuery, normalizedQuery } = getQueryFromUrl();

  displaySearchQuery(rawQuery);
  fetchSearchResults(normalizedQuery);
  handleSearchFormSubmit();
}

// Chờ DOM sẵn sàng
document.addEventListener("DOMContentLoaded", initSearchPage);
