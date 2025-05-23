// Hàm xóa dấu tiếng Việt
function removeDiacritics(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Lấy query từ URL
const urlParams = new URLSearchParams(window.location.search);
const rawQuery = urlParams.get("query") || "";
const query = removeDiacritics(rawQuery);

// Hiển thị từ khóa tìm kiếm
document.getElementById("search-query").textContent = rawQuery;

// Tìm kiếm và hiển thị kết quả
if (query) {
  fetch("http://localhost:5151/api/Specialties", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Không lấy được dữ liệu đặc sản!");
      }
      return response.json();
    })
    .then((data) => {
      const searchList = document.getElementById("search-list");

      // Lọc dữ liệu
      const filtered = data.filter((item) => {
        const namePlain = removeDiacritics(item.name);

        // Nếu chỉ gõ 1 chữ: tìm các món bắt đầu bằng chữ đó
        if (query.length === 1) {
          return namePlain.startsWith(query);
        }

        // Nếu gõ nhiều chữ: tìm chứa hoặc khớp chính xác
        return namePlain === query || namePlain.includes(query);
      });

      const gridHtml = filtered.length
        ? `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 py-6">
                    ${filtered
                      .map(
                        (item) => `
                        <div class="search-item bg-white rounded-xl shadow-lg p-5 flex flex-col items-center transition hover:shadow-2xl">
                            <img src="${
                              item.image || "/IMAGES/no-image.png"
                            }" alt="${
                          item.name
                        }" class="w-40 h-40 object-cover rounded-lg mb-4 border border-gray-200">
                            <h3 class="text-lg font-bold mb-2 text-center">${
                              item.name
                            }</h3>
                            <p class="text-gray-600 text-sm mb-4 text-center line-clamp-3">${
                              item.description || ""
                            }</p>
                            <a href="/HTML/chi tiet mon an/detail.html?id=${
                              item.id
                            }" 
                               class="px-5 py-2 bg-gradient-to-r from-pink-500 to-green-400 text-white rounded-full font-semibold shadow hover:opacity-90 transition-all duration-150">
                               Xem chi tiết
                            </a>
                        </div>
                    `
                      )
                      .join("")}
                  </div>`
        : '<p class="text-center text-gray-500 py-8">Không tìm thấy đặc sản nào!</p>';

      searchList.innerHTML = gridHtml;
    })
    .catch((error) => {
      console.error("Lỗi khi tìm kiếm:", error);
      document.getElementById("search-list").innerHTML =
        "<p>Không tìm thấy!</p>";
    });
} else {
  document.getElementById("search-list").innerHTML =
    "<p>Vui lòng nhập từ khóa tìm kiếm!</p>";
}

// Xử lý tìm kiếm mới từ form
document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const newQuery = document.getElementById("search-input").value.trim();
  if (newQuery) {
    window.location.href = `/HTML/Tim kiem/search.html?query=${encodeURIComponent(
      newQuery
    )}`;
  }
});
