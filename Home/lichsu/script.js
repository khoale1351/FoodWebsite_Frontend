function saveToHistory(dacSan) {
    let history = JSON.parse(localStorage.getItem('viewHistory')) || [];
    // Tránh trùng lặp: Chỉ lưu nếu món chưa có trong lịch sử
    if (!history.some(item => item.id === dacSan.id)) {
        history.push(dacSan);
        localStorage.setItem('viewHistory', JSON.stringify(history));
    }
}

// Gọi hàm này khi người dùng xem một món (ví dụ: trong trang chi tiết)
// Giả sử bạn lấy được dữ liệu món từ API
fetch('http://localhost:7177/api/DacSan/1', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
})
    .then(response => response.json())
    .then(dacSan => {
        saveToHistory({
            id: dacSan.id,
            name: dacSan.name,
            description: dacSan.description,
            image: dacSan.image || 'default-image.jpg', // Hình ảnh món, nếu API trả về
            tinhThanhId: dacSan.tinhThanhId
        });
    });

function clearHistory() {
    localStorage.removeItem('viewHistory');
    loadHistory();
}

// Thêm nút xóa vào khampha.html
document.querySelector('.history-container').insertAdjacentHTML('beforeend', `
    <button onclick="clearHistory()" class="clear-history">Xóa Lịch Sử</button>
`);

function saveToServerHistory(dacSanId) {
    fetch('http://localhost:7177/api/History', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId: 'user-id', dacSanId })
    });
}