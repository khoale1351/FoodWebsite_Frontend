function removeDiacritics(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getQueryFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const rawQuery = urlParams.get("query") || "";
  return {
    rawQuery,
    normalizedQuery: removeDiacritics(rawQuery),
  };
}

function displaySearchQuery(query) {
  const el = document.getElementById("search-query");
  if (el) el.textContent = query;
}

function getFirstImageUrl(item) {
  const apiBaseUrl = "http://localhost:5151";

  if (item.images) {
    return `${apiBaseUrl}${item.images}`;
  }

  if (item.image) {
    return `${apiBaseUrl}${item.image}`;
  }

  return "/IMAGES/no-image.png";
}

function createSearchResultHtml(items) {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 py-6">
      ${items
        .map((item) => {
          const imageUrl = getFirstImageUrl(item);

          return `
          <div class="search-item bg-white rounded-xl shadow-lg p-5 flex flex-col items-center transition hover:shadow-2xl">
            <img src="${imageUrl}" alt="${item.name}"
                 class="w-40 h-40 object-cover rounded-lg mb-4 border border-gray-200">
            <h3 class="text-lg font-bold mb-2 text-center">${item.name}</h3>
            <p class="text-gray-600 text-sm mb-4 text-center line-clamp-3">${
              item.description || ""
            }</p>
            <a href="/HTML/chi-tiet-mon-an/detail.html?id=${item.id}"
               class="px-5 py-2 bg-gradient-to-r from-pink-500 to-green-400 text-white rounded-full font-semibold shadow hover:opacity-90 transition-all duration-150">
              Xem chi tiết
            </a>
          </div>`;
        })
        .join("")}
    </div>
  `;
}

function displayMessage(message, className = "text-gray-500") {
  const list = document.getElementById("search-list");
  if (list) {
    list.innerHTML = `<p class="text-center ${className} py-8">${message}</p>`;
  }
}

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
  } catch (err) {
    console.error("Lỗi tìm kiếm:", err);
    displayMessage(
      "Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau!",
      "text-red-500"
    );
  }
}

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

function initSearchPage() {
  const { rawQuery } = getQueryFromUrl();
  displaySearchQuery(rawQuery);
  fetchSearchResults(rawQuery); // Gửi nguyên văn, không normalize
  handleSearchFormSubmit();
}

document.addEventListener("DOMContentLoaded", initSearchPage);
