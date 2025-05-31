document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  // Ẩn log/info, chỉ giữ lại warn/error
  console.log = function () {};
  console.info = function () {};
  console.log("Token:", token);
  const loginSection = document.getElementById("login-section");
  const userInfoDiv = document.getElementById("user-info");
  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");
  const userSection = document.getElementById("user-section");

  if (loginSection && userSection) {
    // Ví dụ: khi đã đăng nhập
    loginSection.style.display = "none";
    userSection.style.display = "flex"; // hoặc 'block' tùy CSS
  }

  // Ẩn/hiển thị login-section
  if (token && loginSection) {
    loginSection.style.display = "none";
    console.log("Đã ẩn login-section do có token");
  } else if (loginSection) {
    loginSection.style.display = "flex";
    console.log("Hiển thị login-section do không có token");
  }

  // Hiển thị thông tin tài khoản và nút Đăng xuất
  if (token && userInfoDiv) {
    try {
      const response = await fetch("http://localhost:5151/api/Auth/profile", {
        headers: { Authorization: "Bearer " + token },
      });
      console.log("Response status:", response.status);
      if (response.ok) {
        const profile = await response.json();
        console.log("Profile:", profile);
        userInfoDiv.innerHTML = `
                    <span>Chào, <b>${
                      profile.fullName ||
                      profile.username ||
                      profile.email ||
                      "Người dùng"
                    }</b></span>
                    <button id="logout-btn" class="auth-btn" type="button">Đăng xuất</button>
                `;
        userInfoDiv.style.display = "flex";
        // Đảm bảo nút logout-btn tồn tại trước khi gắn sự kiện
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
          console.log("Đã tìm thấy logout-btn, gắn sự kiện click");
          logoutBtn.removeEventListener("click", handleLogout);
          logoutBtn.addEventListener("click", handleLogout);
        } else {
          console.error("Không tìm thấy logout-btn sau khi render");
        }
      } else {
        console.log("API profile thất bại:", response.status);
        userInfoDiv.style.display = "none";
        loginSection.style.display = "flex";
      }
    } catch (error) {
      console.error("Lỗi khi lấy profile:", error);
      userInfoDiv.style.display = "none";
      loginSection.style.display = "flex";
    }
  } else if (userInfoDiv) {
    userInfoDiv.style.display = "none";
    console.log("userInfoDiv không tìm thấy hoặc không có token");
  }

  // Hàm xử lý đăng xuất
  function handleLogout() {
    console.log("Nút Đăng xuất được bấm");
    localStorage.removeItem("token");
    localStorage.removeItem("viewHistory");
    // KHÔNG khai báo lại loginSection và userInfoDiv ở đây!
    loginSection.style.display = "flex";
    userInfoDiv.style.display = "none";
    if (loginLink) loginLink.style.display = "inline";
    if (registerLink) registerLink.style.display = "inline";
    console.log("Đã đăng xuất");
    // Có thể reload lại trang nếu muốn
    // location.reload();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const loginSection = document.getElementById("login-section");
  const userInfo = document.getElementById("user-info");
  const userSection = document.getElementById("user-section");

  if (loginSection && userSection) {
    // Ví dụ: khi đã đăng nhập
    loginSection.style.display = "none";
    userSection.style.display = "flex"; // hoặc 'block' tùy CSS
  }

  if (token) {
    // Đã đăng nhập
    loginSection.style.display = "none";
    userInfo.style.display = "block";
    // Lấy tên user từ token hoặc API
    fetch("http://localhost:5151/api/Auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        const usernameEl = document.getElementById("username");
        if (usernameEl) usernameEl.textContent = data.fullName || data.email;
      })
      .catch((err) => {
        // Có thể ẩn thông tin user hoặc hiển thị thông báo
      });
  } else {
    // Chưa đăng nhập
    loginSection.style.display = "block";
    userInfo.style.display = "none";
  }
  // Đăng xuất
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    location.reload();
  });

  document.getElementById("logout-btn").onclick = function () {
    localStorage.removeItem("token");
    const loginSection = document.getElementById("login-section");
    const userInfo = document.getElementById("user-info");
    if (loginSection) loginSection.style.display = "flex";
    if (userInfo) userInfo.style.display = "none";
  };

  if (window.location.pathname !== "/HTML/Home/index.html") {
    console.warn("index.js chỉ chạy trên /HTML/Home/index.html");
    return;
  }

  const API_BASE_URL = "http://localhost:5151/api";

  async function fetchAPI(endpoint, options = {}, requireAuth = false) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log("Gọi API:", url);
    try {
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };
      if (requireAuth) {
        if (!token) {
          throw new Error("Không có token để truy cập API yêu cầu xác thực");
        }
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(url, {
        ...options,
        headers,
      });
      if (!response.ok) {
        if (response.status === 401 && requireAuth) {
          localStorage.removeItem("token");
          localStorage.removeItem("viewHistory");
          alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          window.location.href = "/Login-Register/login.html";
        }
        throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Lỗi khi gọi API ${endpoint}:`, error.message);
      throw error;
    }
  }

  async function initMap() {
    try {
      const response = await fetchAPI("/Provinces");
      const provinces = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
        ? response.data
        : Object.values(response);
      const areas = document.querySelectorAll("area");

      areas.forEach((area) => {
        const provinceId = area
          .getAttribute("href")
          ?.split("/")
          .pop()
          ?.replace(".html", "");
        const province = provinces.find(
          (p) => p.id != null && String(p.id) === provinceId
        );

        if (province) {
          area.setAttribute("title", province.name);
          area.setAttribute("data-tooltip", province.name);
        }

        area.addEventListener("mouseover", function (e) {
          // Xóa tooltip cũ nếu có
          const existingTooltip = document.querySelector(".tooltip");
          if (existingTooltip) {
            existingTooltip.remove();
          }

          const provinceName = this.getAttribute("title") || "Không xác định";
          const tooltip = document.createElement("div");
          tooltip.className = "tooltip";
          tooltip.textContent = `Khám phá ẩm thực ${provinceName}`;
          tooltip.style.position = "absolute";
          tooltip.style.background = "var(--primary-color)";
          tooltip.style.color = "#fff";
          tooltip.style.padding = "5px 10px";
          tooltip.style.borderRadius = "5px";
          tooltip.style.zIndex = "50";
          document.body.appendChild(tooltip);

          area.addEventListener("mousemove", function handler(e) {
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
          });

          area.addEventListener(
            "mouseout",
            () => {
              tooltip.remove();
            },
            { once: true }
          );
        });

        area.addEventListener("focus", function () {
          this.style.outline = "2px solid var(--accent-color)";
        });
        area.addEventListener("blur", function () {
          this.style.outline = "none";
        });
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu tỉnh:", error.message);
      alert("Không thể tải dữ liệu bản đồ. Vui lòng thử lại sau.");
    }
  }

  async function applyFilter() {
    const region = document.querySelector('select[name="region"]')?.value;
    const type = document.querySelector('select[name="type"]')?.value;

    try {
      const [specialties, provinces] = await Promise.all([
        fetchAPI("/Specialties", {}, false),
        fetchAPI("/Provinces", {}, false),
      ]);
      let filteredData = specialties;

      if (region) {
        filteredData = filteredData.filter((item) => {
          const province = provinces.find(
            (p) => p.id != null && String(p.id) === String(item.tinhThanhId)
          );
          return province && province.region === region;
        });
      }

      if (type) {
        filteredData = filteredData.filter((item) => item.type === type);
      }

      const resultsContainer = document.createElement("div");
      resultsContainer.className = "filter-results";
      resultsContainer.innerHTML =
        filteredData.length > 0
          ? filteredData
              .map(
                (item) => `
                    <div class="specialty-item">
                        <img src="${
                          item.specialtyImages?.[0]?.imageUrl ||
                          "/images/placeholder.jpg"
                        }" alt="${
                  item.name
                }" style="width: 100%; border-radius: 5px;">
                        <h3>${item.name}</h3>
                        <p>${item.description || "Không có mô tả"}</p>
                        <a href="/chitietcactinh/${
                          item.tinhThanhId
                        }.html" onclick="saveToHistory({ id: '${
                  item.id
                }', name: '${item.name}', description: '${
                  item.description || ""
                }', image: '${
                  item.specialtyImages?.[0]?.imageUrl || ""
                }', tinhThanhId: '${item.tinhThanhId}' })">Xem chi tiết</a>
                    </div>
                `
              )
              .join("")
          : "<p>Không tìm thấy kết quả</p>";

      const oldResults = document.querySelector(".filter-results");
      if (oldResults) oldResults.remove();
      document.querySelector(".map-container")?.after(resultsContainer);
    } catch (error) {
      console.error("Lỗi khi lọc đặc sản:", error.message);
      alert("Không thể lọc đặc sản. Vui lòng thử lại sau.");
    }
  }

  function saveToHistory(dacSan) {
    let history = JSON.parse(localStorage.getItem("viewHistory") || "[]");
    history = history.filter((item) => item.id !== dacSan.id);
    history.unshift(dacSan);
    if (history.length > 10) history.pop();
    localStorage.setItem("viewHistory", JSON.stringify(history));
  }

  if (!token) {
    if (loginSection) loginSection.style.display = "flex";
    if (userInfo) userInfo.style.display = "none";
  }

  initMap();
  if (document.querySelector('select[name="region"]')) {
    document
      .querySelector('select[name="region"]')
      .addEventListener("change", applyFilter);
    document
      .querySelector('select[name="type"]')
      .addEventListener("change", applyFilter);
  }
});
