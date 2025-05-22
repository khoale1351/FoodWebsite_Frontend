document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".login-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;

    try {
      const response = await fetch("http://localhost:5151/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert("Đăng nhập thất bại: " + errorText);
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      window.location.href = "/Home/index.html";
    } catch (err) {
      alert("Có lỗi khi đăng nhập!");
    }
  });
});
