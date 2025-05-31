document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:5151/api";

  // Lấy slug tỉnh từ query string (?province=laocai)
  function getProvinceSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get("province") || "";
  }

  const provinceSlug = getProvinceSlug().toLowerCase();
  const container = document.getElementById("province-specialties");

  const removeVietnameseTones = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/\s+/g, "");

  const renderSpecialties = (specialties, provinceDisplayName) => {
    if (!specialties.length) {
      container.innerHTML = "<p>Không có món ăn nào cho tỉnh này.</p>";
      return;
    }

    const itemsHTML = specialties
      .map((item) => {
        const API_BASE_URL = "http://localhost:5151";
        const imageUrl = item.specialtyImages?.[0]?.imageUrl
          ? `${API_BASE_URL}${item.specialtyImages[0].imageUrl}`
          : "/IMAGES/no-image.png";

        return `
        <div class="search-item bg-white rounded-xl shadow-lg p-5 flex flex-col items-center">
          <img src="${imageUrl}"
               alt="${item.name}" 
               class="w-40 h-40 object-cover rounded-lg mb-4 border border-gray-200" />
          <h3 class="text-lg font-bold mb-2 text-center">${item.name}</h3>
          <p class="text-gray-600 text-sm mb-4 text-center">${
            item.description || ""
          }</p>
          <a href="/HTML/chi-tiet-mon-an/detail.html?id=${item.id}" 
             class="px-5 py-2 bg-gradient-to-r from-pink-500 to-green-400 text-white rounded-full font-semibold shadow hover:opacity-90 transition-all duration-150">
             Xem chi tiết
          </a>
        </div>
      `;
      })
      .join("");

    container.innerHTML = `
    <h2 class="text-xl font-bold mb-2">Các món ăn nổi bật của ${provinceDisplayName}</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      ${itemsHTML}
    </div>
  `;
  };

  const showError = (message) => {
    container.innerHTML = `<p>${message}</p>`;
  };

  const fetchSpecialtiesByProvince = async () => {
    try {
      if (!provinceSlug) {
        showError("Không xác định được tỉnh thành!");
        return;
      }
      // Lấy danh sách tỉnh
      const provinceRes = await fetch(`${API_BASE}/Provinces`);
      const provinces = await provinceRes.json();

      // Tìm tỉnh theo slug
      const matchedProvince = provinces.find((province) => {
        const slug = removeVietnameseTones(province.name).toLowerCase();
        return slug === provinceSlug;
      });

      if (!matchedProvince) {
        showError("Không tìm thấy tỉnh này!");
        return;
      }

      const provinceId = matchedProvince.id;
      const provinceName = matchedProvince.name;

      const specialtiesRes = await fetch(
        `${API_BASE}/Specialties?provinceId=${provinceId}`
      );
      const specialties = await specialtiesRes.json();

      renderSpecialties(specialties, provinceName);
    } catch (error) {
      showError("Lỗi khi tải dữ liệu!");
      console.error("Fetch error:", error);
    }
  };

  fetchSpecialtiesByProvince();
});
