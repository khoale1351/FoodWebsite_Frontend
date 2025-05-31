document.addEventListener("DOMContentLoaded", async () => {
  let allSpecialties = [];
  const listDiv = document.getElementById("explore-list");
  const regionFilter = document.getElementById("region-filter");
  const filterBtn = document.getElementById("filter-btn");

  // Lấy tất cả món ăn
  async function fetchAllSpecialties() {
    listDiv.innerHTML = "Đang tải...";
    const res = await fetch("http://localhost:5151/api/Specialties");
    allSpecialties = await res.json();
    renderList(allSpecialties);
  }

  // Hiển thị danh sách món ăn
  function renderList(items) {
    if (!items.length) {
      listDiv.innerHTML = "<p>Không có món ăn nào.</p>";
      return;
    }
    listDiv.innerHTML = items.map(s => `
      <div class="specialty-item p-4 border rounded bg-white shadow">
        <img src="${s.imageUrls?.[0] || '/IMAGES/no-image.png'}" alt="${s.name}" class="mb-2 w-full h-40 object-cover rounded">
        <h3 class="font-bold">${s.name}</h3>
        <p class="text-sm">${s.description || ""}</p>
      </div>
    `).join("");
  }

  // Lọc theo miền
  filterBtn.addEventListener("click", () => {
    const region = regionFilter.value;
    if (!region) {
      renderList(allSpecialties);
    } else {
      renderList(allSpecialties.filter(s => s.region === region));
    }
  });

  fetchAllSpecialties();
});