document.addEventListener('DOMContentLoaded', () => {
    const airumniRoster = ["Lê Phúc Thanh Sơn", "Đàm Đức Phong", "Vi Ngọc Minh", "Tào Quang Vinh", "Trần Tiến Đạt", "Ma Phương Nam"];
    
    let createdTeams = {}; 
    let matchScore = { team1: 0, team2: 0 };
    let matchPlayerStats = {}; // Bộ nhớ Box Score cá nhân

    // ==========================================
    // CHUYỂN TAB & CƠ CHẾ TẠO ĐỘI
    // ==========================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.tour-section');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-target')).classList.add('active');

            if(btn.getAttribute('data-target') === 'live-match') updateMatchDropdowns();
        });
    });

    const btnAddTeam = document.getElementById('btn-add-team');
    const inputTeamName = document.getElementById('new-team-name');
    const teamsContainer = document.getElementById('teams-container');

    function createPlayerDropdown() {
        return `<option value="">-- Chọn cầu thủ --</option>` + 
               airumniRoster.map(p => `<option value="${p}">${p}</option>`).join('');
    }

    btnAddTeam.addEventListener('click', () => {
        const teamName = inputTeamName.value.trim();
        if (teamName === '' || createdTeams[teamName]) {
            alert('Tên đội không hợp lệ hoặc đã tồn tại!'); return;
        }

        createdTeams[teamName] = [];
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.innerHTML = `
            <h3>${teamName}</h3>
            <div class="draft-player-box">
                <select class="player-select">${createPlayerDropdown()}</select>
                <button class="btn-primary btn-add-player">Thêm</button>
            </div>
            <ul class="team-players"></ul>
        `;

        const btnAddPlayer = teamCard.querySelector('.btn-add-player');
        const selectPlayer = teamCard.querySelector('.player-select');
        const playersList = teamCard.querySelector('.team-players');

        btnAddPlayer.addEventListener('click', () => {
            const player = selectPlayer.value;
            if (player === '' || createdTeams[teamName].includes(player)) return;
            createdTeams[teamName].push(player);
            playersList.innerHTML += `<li><i class="fa-solid fa-user"></i> ${player}</li>`;
        });

        teamsContainer.appendChild(teamCard);
        inputTeamName.value = '';
    });

    // ==========================================
    // LIVE MATCH & BOX SCORE THƯ KÝ
    // ==========================================
    const selectT1 = document.getElementById('select-team-1');
    const selectT2 = document.getElementById('select-team-2');
    const btnStartMatch = document.getElementById('btn-start-match');
    const matchActiveBoard = document.getElementById('match-active-board');
    
    const scoreT1 = document.getElementById('board-team1-score');
    const scoreT2 = document.getElementById('board-team2-score');

    function updateMatchDropdowns() {
        const options = `<option value="">-- Chọn Đội --</option>` + 
                        Object.keys(createdTeams).map(t => `<option value="${t}">${t}</option>`).join('');
        selectT1.innerHTML = options;
        selectT2.innerHTML = options;
    }

    // Nâng cấp: Thêm đầy đủ các nút bấm chỉ số
    function buildPlayerControl(playerName, teamId) {
        return `
            <div class="player-control-row">
                <div class="player-name-lbl">${playerName}</div>
                <div class="stat-btns">
                    <button class="btn-stat pts" onclick="addPoints('${teamId}', '${playerName}', 1)">+1 PT</button>
                    <button class="btn-stat pts" onclick="addPoints('${teamId}', '${playerName}', 2)">+2 PT</button>
                    <button class="btn-stat pts" onclick="addPoints('${teamId}', '${playerName}', 3)">+3 PT</button>
                    <button class="btn-stat" onclick="recordStat('${playerName}', 'reb')">REB</button>
                    <button class="btn-stat" onclick="recordStat('${playerName}', 'ast')">AST</button>
                    <button class="btn-stat" onclick="recordStat('${playerName}', 'stl')">STL</button>
                    <button class="btn-stat" onclick="recordStat('${playerName}', 'blk')">BLK</button>
                    <button class="btn-stat" onclick="recordStat('${playerName}', 'tov')">TOV</button>
                    <button class="btn-stat" onclick="recordStat('${playerName}', 'pf')">FOUL</button>
                </div>
            </div>
        `;
    }

    btnStartMatch.addEventListener('click', () => {
        const t1Name = selectT1.value;
        const t2Name = selectT2.value;

        if(!t1Name || !t2Name || t1Name === t2Name) {
            alert('Vui lòng chọn 2 đội khác nhau!'); return;
        }

        document.getElementById('board-team1-name').textContent = t1Name;
        document.getElementById('board-team2-name').textContent = t2Name;
        
        // Reset Điểm Toàn Đội
        matchScore = { team1: 0, team2: 0 };
        scoreT1.textContent = "0"; scoreT2.textContent = "0";

        // Khởi tạo/Reset Box Score Cá Nhân
        matchPlayerStats = {};
        const allPlayers = [...createdTeams[t1Name], ...createdTeams[t2Name]];
        allPlayers.forEach(player => {
            const teamOfPlayer = createdTeams[t1Name].includes(player) ? t1Name : t2Name;
            matchPlayerStats[player] = { 
                team: teamOfPlayer, pts: 0, fgm: 0, fg3m: 0, ftm: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, pf: 0 
            };
        });

        // Vẽ danh sách nút bấm
        document.getElementById('controls-list-team1').innerHTML = createdTeams[t1Name].map(p => buildPlayerControl(p, 'team1')).join('');
        document.getElementById('controls-list-team2').innerHTML = createdTeams[t2Name].map(p => buildPlayerControl(p, 'team2')).join('');

        matchActiveBoard.classList.remove('hidden');
        renderBoxScore(); // Vẽ bảng thống kê lần đầu
    });

    // ==========================================
    // HÀM XỬ LÝ SỐ LIỆU & VẼ LẠI BẢNG (REAL-TIME UI)
    // ==========================================
    window.addPoints = function(teamId, playerName, points) {
        // 1. Cộng điểm đội
        matchScore[teamId] += points;
        if(teamId === 'team1') scoreT1.textContent = matchScore.team1;
        else scoreT2.textContent = matchScore.team2;

        // 2. Cộng điểm & chỉ số cá nhân (Tự động phân loại FGM, 3PM, FTM)
        matchPlayerStats[playerName].pts += points;
        if (points === 1) {
            matchPlayerStats[playerName].ftm += 1; // Ném phạt
        } else if (points === 2) {
            matchPlayerStats[playerName].fgm += 1; // Ném rổ thường
        } else if (points === 3) {
            matchPlayerStats[playerName].fgm += 1; // Ném rổ thành công
            matchPlayerStats[playerName].fg3m += 1; // Tính thêm là quả 3 điểm
        }

        renderBoxScore(); // Cập nhật lại giao diện bảng
    };

    window.recordStat = function(playerName, statType) {
        if (matchPlayerStats[playerName][statType] !== undefined) {
            matchPlayerStats[playerName][statType] += 1;
            renderBoxScore();
        }
    };

    function renderBoxScore() {
        const tbody = document.querySelector('#live-box-score tbody');
        tbody.innerHTML = ''; // Xoá sạch bảng cũ
        
        // Vẽ lại toàn bộ cầu thủ cùng chỉ số mới nhất
        for (const [player, stats] of Object.entries(matchPlayerStats)) {
            tbody.innerHTML += `
                <tr>
                    <td style="text-align:left"><strong>${player}</strong></td>
                    <td style="text-align:left">${stats.team}</td>
                    <td style="color:var(--primary-color); font-weight:bold">${stats.pts}</td>
                    <td>${stats.fgm}</td>
                    <td>${stats.fg3m}</td>
                    <td>${stats.ftm}</td>
                    <td>${stats.reb}</td>
                    <td>${stats.ast}</td>
                    <td>${stats.stl}</td>
                    <td>${stats.blk}</td>
                    <td>${stats.tov}</td>
                    <td>${stats.pf}</td>
                </tr>
            `;
        }
    }
});