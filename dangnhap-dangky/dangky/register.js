document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) {
        console.error('Không tìm thấy form đăng ký');
        return;
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            const response = await fetch('http://localhost:5151/api/Auth/Register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();

            if (response.ok) {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                window.location.href = '/dangnhap-dangky/dangnhap/login.html';
            } else {
                alert('Đăng ký thất bại: ' + (data.message || data.error || 'Lỗi không xác định'));
            }
        } catch (error) {
            console.error('Lỗi khi đăng ký:', error.message);
            alert('Lỗi kết nối. Vui lòng thử lại.');
        }
    });
});