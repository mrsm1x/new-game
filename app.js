window.user = {
    username: "ELION",
    avatarSeed: "ELION",
    balance: 5000,
    staked: 0,
    stakingProfit: 0.0,
    referrals: 12,
    stats: {
        totalGames: 0,
        wonGames: 0
    }
};

window.updateBalanceUI = function() {
    document.getElementById('main-balance').innerText = window.user.balance.toLocaleString();
    document.querySelectorAll('.nav-balance').forEach(el => el.innerText = window.user.balance.toLocaleString());
    
    const stakedAmtEl = document.getElementById('staked-amount');
    const stakedProfEl = document.getElementById('staked-profit');
    const statStakedEl = document.getElementById('stat-staked');
    
    if (stakedAmtEl) stakedAmtEl.innerText = window.user.staked.toLocaleString();
    if (stakedProfEl) stakedProfEl.innerText = window.user.stakingProfit.toFixed(4);
    if (statStakedEl) statStakedEl.innerText = window.user.staked.toLocaleString();

    if (typeof renderLeaderboard === 'function') renderLeaderboard();
};

window.updateStatsUI = function() {
    const totalEl = document.getElementById('stat-total');
    const winsEl = document.getElementById('stat-wins');
    if (totalEl) totalEl.innerText = window.user.stats.totalGames;
    if (winsEl) winsEl.innerText = window.user.stats.wonGames;
};

// Функция добавления записей истории во все игровые страницы
window.addLocalGameHistory = function(gameKey, isWin, amount) {
    const containerId = `${gameKey}-user-history`;
    const container = document.getElementById(containerId);
    if (!container) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const statusText = isWin ? "Победа" : "Проигрыш";
    const statusClass = isWin ? "text-cyan" : "text-danger";
    const prefix = isWin ? "+" : "-";

    const itemHTML = `
        <div class="history-item">
            <div>
                <span class="${statusClass} font-bold">[${statusText}]</span> 
                <span style="color:rgba(255,255,255,0.4); font-size:11px; margin-left:5px;">${time}</span>
            </div>
            <div class="${statusClass}">${prefix}${amount.toLocaleString()} 💎</div>
        </div>
    `;
    
    container.innerHTML = itemHTML + container.innerHTML;
};

// Навигация
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
const mainNav = document.getElementById('main-nav');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    });
});

window.openGame = function(gameId) {
    views.forEach(v => v.classList.remove('active'));
    document.getElementById(gameId).classList.add('active');
    mainNav.classList.add('hidden');
};

window.closeGame = function() {
    views.forEach(v => v.classList.remove('active'));
    document.getElementById('view-games').classList.add('active');
    mainNav.classList.remove('hidden');
};

// Модалки
window.openModal = id => document.getElementById(id).style.display = 'block';
window.closeModal = id => document.getElementById(id).style.display = 'none';

window.processDeposit = function() {
    const amount = parseInt(document.getElementById('deposit-amount').value);
    if (isNaN(amount) || amount <= 0) return;
    
    window.user.balance += amount;
    window.updateBalanceUI();
    window.closeModal('deposit-modal');
};

// Стейкинг
window.processFreeze = function() {
    const input = document.getElementById('invest-amount');
    const amount = parseInt(input.value);
    if (isNaN(amount) || amount < 100) return alert('Минимальная сумма заморозки: 100 коинов');
    if (amount > window.user.balance) return alert('Недостаточно средств на основном балансе');

    window.user.balance -= amount;
    window.user.staked += amount;
    input.value = '';
    window.updateBalanceUI();
    alert(`Успешно заморожено ${amount} коинов под 4% в день!`);
};

window.processClaimStaking = function() {
    if (window.user.stakingProfit <= 0.0001) return alert('Нет доступного дохода для снятия');
    
    const profitToClaim = window.user.stakingProfit;
    window.user.balance += Math.floor(profitToClaim * 100) / 100;
    window.user.stakingProfit = 0;
    window.updateBalanceUI();
    alert(`Вы забрали накопленный доход!`);
};

window.saveProfileSettings = function() {
    const usernameInput = document.getElementById('edit-username').value.trim();
    const avatarSeedInput = document.getElementById('edit-avatar-seed').value.trim();
    
    if (!usernameInput) return alert('Никнейм не может быть пустым');
    
    window.user.username = usernameInput;
    window.user.avatarSeed = avatarSeedInput || usernameInput;
    
    document.getElementById('profile-username').innerHTML = `${window.user.username} <i class="fa-solid fa-pen text-cyan" style="cursor:pointer; font-size: 14px; margin-left: 5px;" onclick="openModal('edit-profile-modal')"></i>`;
    document.getElementById('profile-avatar').src = `https://api.dicebear.com/6.x/avataaars/svg?seed=${window.user.avatarSeed}`;
    
    document.getElementById('ref-link-input').value = `https://t.me/NeonPlatformBot?start=ref_${window.user.username.toLowerCase()}`;
    
    window.closeModal('edit-profile-modal');
    window.renderLeaderboard();
};

window.copyReferralLink = function() {
    const linkInput = document.getElementById('ref-link-input');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(linkInput.value);
    alert('Реферальная ссылка скопирована в буфер обмена!');
};

window.renderReferrals = function() {
    const list = document.getElementById('referrals-list');
    if (!list) return;

    const mockRefs = [
        { name: "@winksy_modder", date: "24.06.2026", earned: 450 },
        { name: "@cyber_moldova", date: "25.06.2026", earned: 120 },
        { name: "@logistics_pro", date: "28.06.2026", earned: 890 },
        { name: "@user_7777", date: "01.07.2026", earned: 0 },
        { name: "@alpha_tester", date: "02.07.2026", earned: 310 }
    ];

    list.innerHTML = '';
    mockRefs.forEach(ref => {
        list.innerHTML += `
            <div class="lb-item">
                <div class="lb-user">
                    <i class="fa-solid fa-user-astronaut text-purple" style="font-size: 20px; width: 25px;"></i>
                    <div style="display: flex; flex-direction: column;">
                        <span class="font-bold">${ref.name}</span>
                        <span style="font-size: 11px; color: rgba(255,255,255,0.4);">Регистрация: ${ref.date}</span>
                    </div>
                </div>
                <div class="text-cyan text-sm">+${ref.earned} <i class="fa-solid fa-gem"></i></div>
            </div>
        `;
    });

    document.getElementById('ref-count-page').innerText = window.user.referrals;
    document.getElementById('ref-progress').style.width = `${Math.min((window.user.referrals / 25) * 100, 100)}%`;
};

function initApp() {
    window.updateBalanceUI();
    window.updateStatsUI();
    window.renderReferrals();

    setInterval(() => {
        if (window.user.staked > 0) {
            const rewardPerSecond = window.user.staked * (0.04 / 86400);
            window.user.stakingProfit += rewardPerSecond;
            const profitDisplay = document.getElementById('staked-profit');
            if (profitDisplay) profitDisplay.innerText = window.user.stakingProfit.toFixed(4);
        }
    }, 1000);

    const gamesList = ['Crash', 'Mines', 'CoinFlip'];
    setInterval(() => {
        const botName = `User_${Math.floor(Math.random() * 9999)}`;
        const game = gamesList[Math.floor(Math.random() * gamesList.length)];
        const win = Math.floor(Math.random() * 500) + 10;
        const feed = document.getElementById('live-feed');
        if(feed) feed.innerHTML = `<div style="animation: popIn 0.3s; width: 100%;">👾 ${botName} сделал <b>+${win}</b> в ${game}</div>`;
    }, 3000);
}

window.renderLeaderboard = function() {
    const mockPlayers = [
        { name: "NeonGod", coins: 250000 },
        { name: window.user.username, coins: (window.user.balance + window.user.staked) },
        { name: "CyberPunk", coins: 4200 },
        { name: "Glitch", coins: 150 },
        { name: "Bot_Null", coins: 10 }
    ];
    
    const sorted = mockPlayers.sort((a, b) => b.coins - a.coins);
    const list = document.getElementById('leaderboard-list');
    if(!list) return;
    list.innerHTML = '';

    sorted.forEach((player, index) => {
        let frameClass = '';
        if (index === 0) frameClass = 'frame-gold';
        else if (index === 1) frameClass = 'frame-silver';
        else if (index === 2) frameClass = 'frame-bronze';

        if (player.name === window.user.username) {
            const pf = document.getElementById('player-frame');
            if (pf) pf.className = `avatar-container ${frameClass}`;
        }

        list.innerHTML += `
            <div class="lb-item">
                <div class="lb-user">
                    <span class="lb-rank">#${index + 1}</span>
                    <div class="lb-avatar ${frameClass}" style="background-color: var(--bg-dark);">
                        <img src="https://api.dicebear.com/6.x/avataaars/svg?seed=${player.name}" style="width:100%; border-radius:50%;">
                    </div>
                    <span>${player.name}</span>
                </div>
                <div class="text-cyan font-bold">${player.coins.toLocaleString()} <i class="fa-solid fa-gem"></i></div>
            </div>
        `;
    });
};

initApp();
window.renderLeaderboard();