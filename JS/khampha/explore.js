document.addEventListener("DOMContentLoaded", async () => {
  let allSpecialties = [];
  const listDiv = document.getElementById("explore-list");
  const regionFilter = document.getElementById("region-filter");
  const provinceFilter = document.getElementById("province-filter");
  const filterBtn = document.getElementById("filter-btn");

  // Lấy tất cả món ăn từ API
  async function fetchAllSpecialties() {
    listDiv.innerHTML = "Đang tải...";
    try {
      const res = await fetch("http://localhost:5151/api/Specialties");
      allSpecialties = await res.json();
      console.log(allSpecialties); // Thêm dòng này để kiểm tra dữ liệu
      renderList(allSpecialties);
      renderProvinceOptions();
    } catch (e) {
      listDiv.innerHTML = "<p class='text-red-500'>Không thể tải dữ liệu.</p>";
    }
  }

  // Lấy danh sách tỉnh/thành từ dữ liệu và render vào dropdown, có lọc theo vùng miền nếu truyền vào
  function renderProvinceOptions(region = "") {
    let provinces = allSpecialties
      .filter(s => {
        if (!region) return true;
        const regionKeys = regionMap[region].map(normalizeRegion);
        const reg = normalizeRegion(s.province?.region) || normalizeRegion(s.province?.regionPlain);
        return regionKeys.includes(reg);
      })
      .map(s => s.province?.name)
      .filter(Boolean);

    provinces = Array.from(new Set(provinces));
    provinceFilter.innerHTML = `<option value="">Tất cả tỉnh/thành</option>` +
      provinces.map(p => `<option value="${p}">${p}</option>`).join("");
  }

  // Hiển thị danh sách món ăn
  function renderList(items) {
    if (!items.length) {
      listDiv.innerHTML = "<p>Không có món ăn nào.</p>";
      return;
    }
    listDiv.innerHTML = items.map(s => `
      <div class="specialty-item p-4 border rounded bg-white shadow flex flex-col">
        <img src="${getValidImageUrl(s)}" alt="${s.name}" class="mb-2 w-full h-40 object-cover rounded">
        <h3 class="font-bold">${s.name}</h3>
        <p class="text-sm mb-2">${s.description || ""}</p>
        <button onclick="window.location.href='/HTML/chi-tiet-mon-an/detail.html?id=${s.id}'"
          class="mt-auto px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Xem chi tiết</button>
      </div>
    `).join("");
  }

  function getValidImageUrl(item) {
    const apiBaseUrl = "http://localhost:5151";
    if (item.images) return `${apiBaseUrl}${item.images}`;
    if (item.image) return `${apiBaseUrl}${item.image}`;
    if (item.imageUrls?.[0]) return `${apiBaseUrl}${item.imageUrls[0]}`;
    if (item.specialtyImages?.[0]?.imageUrl) return `${apiBaseUrl}${item.specialtyImages[0].imageUrl}`;
    return "/IMAGES/no-image.png";
  }

  function normalizeRegion(str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "");
  }

  const regionMap = {
    "Miền Bắc": ["mienbac", "bac"],
    "Miền Trung": ["mientrung", "trung"],
    "Miền Nam": ["miennam", "nam"]
  };

  regionFilter.addEventListener("change", () => {
    renderProvinceOptions(regionFilter.value);
    filterAndRender();
  });
  provinceFilter.addEventListener("change", filterAndRender);

  function filterAndRender() {
    const region = regionFilter.value;
    const province = provinceFilter.value;
    let filtered = allSpecialties;

    if (region) {
      const regionKeys = regionMap[region].map(normalizeRegion);
      filtered = filtered.filter(s => {
        const reg = normalizeRegion(s.province?.region) || normalizeRegion(s.province?.regionPlain);
        return regionKeys.includes(reg);
      });
    }
    if (province) {
      filtered = filtered.filter(s => s.province?.name === province);
    }
    renderList(filtered);
  }

  fetchAllSpecialties().then(renderProvinceOptions);
});