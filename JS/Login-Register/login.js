document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".login-form");
  if (!form) return;

  const emailInput = form.email;
  const passwordInput = form.password;
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const formError = document.getElementById("form-error");

  // Ẩn lỗi helper
  function showError(element, message) {
    element.textContent = message;
    element.classList.remove("hidden");
  }

  function hideError(element) {
    element.textContent = "";
    element.classList.add("hidden");
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) {
      showError(emailError, "Email không được để trống.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      showError(emailError, "Vui lòng nhập email hợp lệ.");
      return false;
    }
    hideError(emailError);
    return true;
  }

  function validatePassword() {
    const value = passwordInput.value.trim();
    if (!value) {
      showError(passwordError, "Mật khẩu không được để trống.");
      return false;
    }
    if (value.length < 6) {
      showError(passwordError, "Mật khẩu phải nhiều hơn 6 ký tự.");
      return false;
    }
    hideError(passwordError);
    return true;
  }

  emailInput.addEventListener("blur", validateEmail);
  passwordInput.addEventListener("blur", validatePassword);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    hideError(formError);

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    if (!isEmailValid || !isPasswordValid) return;

    try {
      const response = await fetch("http://localhost:5151/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value.trim(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        showError(formError, `Đăng nhập thất bại: ${errorText}`);
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      window.location.href = "/HTML/Home/index.html";
    } catch (err) {
      showError(formError, "Đăng nhập thất bại. Vui lòng thử lại.");
    }
  });
});
