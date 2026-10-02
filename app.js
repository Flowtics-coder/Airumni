document.addEventListener('DOMContentLoaded', () => {
    // 1. DATA ĐỘI HÌNH AIRUMNI
    const airumniRoster = [
        { name: "Lê Phúc Thanh Sơn", position: "PG/SG", number: "00" },
        { name: "Đàm Đức Phong", position: "SF / PF", number: "00" },
        { name: "Vi Ngọc Minh", position: "PG / SF", number: "00" },
        { name: "Tào Quang Vinh", position: "SG / SF", number: "00" },
        { name: "Trần Tiến Đạt", position: "TBA", number: "00" },
        { name: "Ma Phương Nam", position: "C", number: "00" }
    ];

    // Render danh sách đội hình ra HTML
    const rosterContainer = document.getElementById('roster-container');
    if(rosterContainer) {
        airumniRoster.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'roster-card';
            playerCard.innerHTML = `
                <div class="player-icon"><i class="fa-solid fa-user"></i></div>
                <div class="player-info">
                    <h4>${player.name}</h4>
                    <p>Pos: <strong>${player.position}</strong></p>
                </div>
            `;
            rosterContainer.appendChild(playerCard);
        });
    }

    // 2. LOGIC BỘ LỌC CHỈ SỐ (STAT CATEGORY FILTER)
    const statSelect = document.getElementById('stat-category');
    const allStatCards = document.querySelectorAll('.stat-card');

    if(statSelect) {
        statSelect.addEventListener('change', (e) => {
            const selectedStat = e.target.value;
            
            allStatCards.forEach(card => {
                if (selectedStat === 'all') {
                    card.style.display = 'block'; // Hiện tất cả
                } else {
                    // Nếu thuộc tính data-stat khớp với lựa chọn thì hiện, không thì ẩn
                    if (card.getAttribute('data-stat') === selectedStat) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    }

    // 3. LOGIC CHUYỂN TAB CŨ (Giữ nguyên)
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.page-section');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(sec => sec.classList.add('hidden'));
            link.classList.add('active');
            document.getElementById(link.getAttribute('data-target')).classList.remove('hidden');
        });
    });
    
    // ==========================================
    // 4. LOGIC MODAL TẠO GIẢI ĐẤU (POP-UP)
    // ==========================================
    const createTourBtn = document.getElementById('btn-create-tour');
    const tourModal = document.getElementById('create-tour-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const cancelTourBtn = document.getElementById('cancel-tour-btn');
    const createTourForm = document.getElementById('create-tour-form');

    if(createTourBtn && tourModal) {
        // Hàm đóng Modal
        const closeModal = () => {
            tourModal.classList.add('hidden');
            createTourForm.reset(); // Xóa sạch dữ liệu đã gõ khi đóng
        };

        // Bấm nút "Create New Tournament" thì mở Modal
        createTourBtn.addEventListener('click', () => {
            tourModal.classList.remove('hidden');
        });

        // Bấm nút X hoặc nút Cancel thì đóng
        closeModalBtn.addEventListener('click', closeModal);
        cancelTourBtn.addEventListener('click', closeModal);

        // Bấm ra ngoài khoảng đen (overlay) thì cũng đóng
        tourModal.addEventListener('click', (e) => {
            if (e.target === tourModal) {
                closeModal();
            }
        });

        // Xử lý khi bấm nút "Create Tournament" (Submit Form)
        createTourForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Ngăn trình duyệt tự động load lại trang
            
            // Lấy dữ liệu bạn vừa nhập
            const tourName = document.getElementById('tour-name').value;
            const tourFormat = document.getElementById('tour-format').value;
            const tourType = document.getElementById('tour-type').value;
            
            // Tạm thời hiển thị thông báo. (Sau này đoạn này sẽ đẩy dữ liệu lên Firebase)
            alert(`Thành công! Đã tạo giải: \n- Tên: ${tourName} \n- Thể thức: ${tourFormat} \n- Cơ chế: ${tourType}`);
            
            // Đóng Modal sau khi tạo xong
            closeModal();
        });
    }
});