document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.register-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = form.username.value;
        const fullName = form.fullname.value;
        const email = form.email.value;
        const phoneNumber = form.phonenumber.value;
        const password = form.password.value;
        const confirmPassword = form['confirm-password'].value;

        if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            const response = await fetch('http://localhost:5151/api/Auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    fullName,
                    email,
                    phoneNumber,
                    password
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                alert('Đăng ký thất bại: ' + errorText);
                return;
            }

            alert('Đăng ký thành công!');
            window.location.href = '/dangnhap-dangky/dangnhap/login.html';
        } catch (err) {
            alert('Đăng ký thất bại !');
        }
    });
});