document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) {
        console.error('Không tìm thấy form đăng nhập');
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:7177/api/Auth/Login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                alert('Đăng nhập thành công!');
                window.location.href = '/Home/index.html';
            } else {
                alert('Đăng nhập thất bại: ' + (data.message || data.error || 'Lỗi không xác định'));
            }
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error.message);
            alert('Lỗi kết nối. Vui lòng thử lại.');
        }
    });
});