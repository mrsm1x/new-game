let minesGrid = [], minesBet = 0, minesMultiplier = 1.0, totalMines = 3;

window.startMines = function() {
    minesBet = parseInt(document.getElementById('mines-bet').value);
    totalMines = parseInt(document.getElementById('mines-count').value);
    
    if (minesBet > window.user.balance || minesBet <= 0) return alert('Ошибка ставки');
    if (totalMines < 1 || totalMines > 24) return;

    window.user.balance -= minesBet;
    window.user.stats.totalGames++;
    window.updateBalanceUI();
    window.updateStatsUI();

    minesMultiplier = 1.0;
    document.getElementById('btn-mines-start').classList.add('hidden');
    document.getElementById('btn-mines-cashout').classList.remove('hidden');
    document.getElementById('mines-win-amount').innerText = minesBet;
    
    const gridEl = document.getElementById('mines-grid');
    gridEl.classList.remove('disabled');
    gridEl.innerHTML = '';
    
    minesGrid = Array(25).fill('safe');
    let placed = 0;
    while(placed < totalMines) {
        let r = Math.floor(Math.random() * 25);
        if (minesGrid[r] === 'safe') { minesGrid[r] = 'mine'; placed++; }
    }

    for (let i = 0; i < 25; i++) {
        let btn = document.createElement('div');
        btn.className = 'mine-btn';
        btn.onclick = () => clickMine(i, btn);
        gridEl.appendChild(btn);
    }
};

function clickMine(index, btnEl) {
    if (btnEl.classList.contains('safe') || btnEl.classList.contains('boom')) return;

    if (minesGrid[index] === 'mine') {
        btnEl.classList.add('boom');
        btnEl.innerHTML = '<i class="fa-solid fa-burst"></i>';
        endMines(false);
    } else {
        btnEl.classList.add('safe');
        btnEl.innerHTML = '<i class="fa-solid fa-gem"></i>';
        minesMultiplier += (0.05 * totalMines); 
        document.getElementById('mines-win-amount').innerText = Math.floor(minesBet * minesMultiplier);
    }
}

window.cashoutMines = function() {
    window.user.balance += Math.floor(minesBet * minesMultiplier);
    window.user.stats.wonGames++;
    window.updateBalanceUI();
    window.updateStatsUI();
    endMines(true);
};

function endMines(isWin) {
    document.getElementById('mines-grid').classList.add('disabled');
    document.getElementById('btn-mines-cashout').classList.add('hidden');
    document.getElementById('btn-mines-start').classList.remove('hidden');
    
    // Добавляем запись в лог истории страницы
    const changeAmount = isWin ? Math.floor(minesBet * minesMultiplier) : minesBet;
    window.addLocalGameHistory('mines', isWin, changeAmount);

    if (!isWin) {
        document.getElementById('mines-win-amount').innerText = '0';
    }
    
    const cells = document.querySelectorAll('.mine-btn');
    minesGrid.forEach((type, i) => {
        if (type === 'mine' && !cells[i].classList.contains('boom')) {
            cells[i].innerHTML = '<i class="fa-solid fa-burst text-danger" style="opacity: 0.5"></i>';
        }
    });
}