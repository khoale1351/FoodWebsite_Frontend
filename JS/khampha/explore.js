document.addEventListener("DOMContentLoaded", async () => {
  let allSpecialties = [];
  const listDiv = document.getElementById("explore-list");
  const regionFilter = document.getElementById("region-filter");
  const filterBtn = document.getElementById("filter-btn");

  // Lấy tất cả món ăn từ API
  async function fetchAllSpecialties() {
    listDiv.innerHTML = "Đang tải...";
    try {
      const res = await fetch("http://localhost:5151/api/Specialties");
      allSpecialties = await res.json();
      console.log(allSpecialties); // Thêm dòng này để kiểm tra dữ liệu
      renderList(allSpecialties);
    } catch (e) {
      listDiv.innerHTML = "<p class='text-red-500'>Không thể tải dữ liệu.</p>";
    }
  }

  // Hiển thị danh sách món ăn
  function renderList(items) {
    if (!items.length) {
      listDiv.innerHTML = "<p>Không có món ăn nào.</p>";
      return;
    }
    listDiv.innerHTML = items.map(s => `
      <div class="specialty-item p-4 border rounded bg-white shadow">
        <img src="${getValidImageUrl(s)}" alt="${s.name}" class="mb-2 w-full h-40 object-cover rounded">
        <h3 class="font-bold">${s.name}</h3>
        <p class="text-sm">${s.description || ""}</p>
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

  // Lọc theo vùng miền khi bấm nút
  filterBtn.addEventListener("click", () => {
    const region = regionFilter.value;
    if (!region) {
      renderList(allSpecialties);
    } else {
      const regionKeys = regionMap[region].map(normalizeRegion);
      renderList(
        allSpecialties.filter(s => {
          const reg = normalizeRegion(s.province?.region) || normalizeRegion(s.province?.regionPlain);
          return regionKeys.includes(reg);
        })
      );
    }
  });

  fetchAllSpecialties();
});