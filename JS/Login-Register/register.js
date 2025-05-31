document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".register-form");
  if (!form) return;

  const fields = {
    username: form.username,
    fullname: form.fullname,
    email: form.email,
    phonenumber: form.phonenumber,
    password: form.password,
    confirmPassword: form["confirm-password"],
  };

  const errors = {
    username: document.getElementById("username-error"),
    fullname: document.getElementById("fullname-error"),
    email: document.getElementById("email-error"),
    phonenumber: document.getElementById("phonenumber-error"),
    password: document.getElementById("password-error"),
    confirmPassword: document.getElementById("confirm-password-error"),
    form: document.getElementById("form-error"),
  };

  function showError(element, message) {
    element.textContent = message;
    element.classList.remove("hidden");
  }

  function hideError(element) {
    element.textContent = "";
    element.classList.add("hidden");
  }

  function validateUsername() {
    const value = fields.username.value.trim();
    if (!value) {
      showError(errors.username, "Tên đăng nhập không được để trống.");
      return false;
    }
    hideError(errors.username);
    return true;
  }

  function validateFullname() {
    const value = fields.fullname.value.trim();
    if (!value) {
      showError(errors.fullname, "Họ và tên không được để trống.");
      return false;
    }
    hideError(errors.fullname);
    return true;
  }

  function validateEmail() {
    const value = fields.email.value.trim();
    if (!value) {
      showError(errors.email, "Email không được để trống.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      showError(errors.email, "Email không hợp lệ.");
      return false;
    }
    hideError(errors.email);
    return true;
  }

  function validatePhone() {
    const value = fields.phonenumber.value.trim();
    if (value && !/^\d{9,15}$/.test(value)) {
      showError(
        errors.phonenumber,
        "Số điện thoại không hợp lệ (9-15 chữ số)."
      );
      return false;
    }
    hideError(errors.phonenumber);
    return true;
  }

  function validatePassword() {
    const value = fields.password.value.trim();
    if (!value) {
      showError(errors.password, "Mật khẩu không được để trống.");
      return false;
    }
    if (value.length < 6) {
      showError(errors.password, "Mật khẩu phải ít nhất 6 ký tự.");
      return false;
    }
    hideError(errors.password);
    return true;
  }

  function validateConfirmPassword() {
    if (fields.confirmPassword.value !== fields.password.value) {
      showError(errors.confirmPassword, "Mật khẩu xác nhận không khớp.");
      return false;
    }
    hideError(errors.confirmPassword);
    return true;
  }

  fields.username.addEventListener("blur", validateUsername);
  fields.fullname.addEventListener("blur", validateFullname);
  fields.email.addEventListener("blur", validateEmail);
  fields.phonenumber.addEventListener("blur", validatePhone);
  fields.password.addEventListener("blur", validatePassword);
  fields.confirmPassword.addEventListener("blur", validateConfirmPassword);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    hideError(errors.form);

    const isValid =
      validateUsername() &&
      validateFullname() &&
      validateEmail() &&
      validatePhone() &&
      validatePassword() &&
      validateConfirmPassword();

    if (!isValid) return;

    const payload = {
      username: fields.username.value.trim(),
      fullName: fields.fullname.value.trim(),
      email: fields.email.value.trim(),
      password: fields.password.value.trim(),
    };

    const phone = fields.phonenumber.value.trim();
    if (phone) {
      payload.phoneNumber = phone;
    }

    try {
      const response = await fetch("http://localhost:5151/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          const allErrors = Object.values(errorData.errors).flat().join(" | ");
          showError(errors.form, "Đăng ký thất bại: " + allErrors);
        } else {
          showError(errors.form, "Đăng ký thất bại.");
        }
        return;
      }

      alert("Đăng ký thành công!");
      window.location.href = "/HTML/Login-Register/login.html";
    } catch (err) {
      showError(errors.form, "Đăng ký thất bại. Vui lòng thử lại.");
    }
  });
});
