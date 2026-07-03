const CRASH_STATES = {
    WAITING: 'WAITING',
    LIVE: 'LIVE'
};

let crashState = CRASH_STATES.WAITING;
let crashTickInterval = null;
let countdownInterval = null;

let currentMultiplier = 1.00;
let targetCrashPoint = 1.00;

let userBetAmount = 0;
let hasPlacedBet = false;   
let hasCashedOut = false;   

// Глобальные массивы для истории
let globalCrashHistory = [1.45, 2.10, 1.08, 12.40, 1.95, 3.20, 1.15]; 

setTimeout(() => {
    renderGlobalCrashRibbon();
    startWaitingPhase();
}, 1000);

function startWaitingPhase() {
    crashState = CRASH_STATES.WAITING;
    currentMultiplier = 1.00;
    hasCashedOut = false;
    
    let countdown = 5.0;
    
    const display = document.getElementById('crash-multiplier');
    const rocket = document.getElementById('crash-rocket');
    const explosion = document.getElementById('crash-explosion');
    
    if (display) {
        display.classList.remove('crashed');
        display.innerText = `До старта: ${countdown.toFixed(1)}s`;
    }
    
    // Сброс положения ракеты
    if (rocket) {
        rocket.className = "rocket-wrapper waiting";
        rocket.style.transform = "translate(0px, 0px) rotate(0deg)";
        rocket.style.display = "block";
    }
    if (explosion) {
        explosion.classList.remove('active');
    }
    
    updateCrashButtonUI();

    countdownInterval = setInterval(() => {
        countdown -= 0.1;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            startLivePhase();
        } else {
            if (display) display.innerText = `До старта: ${countdown.toFixed(1)}s`;
        }
    }, 100);
}

function startLivePhase() {
    crashState = CRASH_STATES.LIVE;
    currentMultiplier = 1.00;
    
    if (hasPlacedBet) {
        window.user.stats.totalGames++;
        window.updateStatsUI();
    }
    
    updateCrashButtonUI();
    
    const rocket = document.getElementById('crash-rocket');
    if (rocket) rocket.className = "rocket-wrapper"; // Убираем анимацию покачивания
    
    targetCrashPoint = Math.random() * 4.0 + 1.01; // Математика краша
    
    const display = document.getElementById('crash-multiplier');

    // Границы контейнера для анимации ракеты
    const arena = document.getElementById('crash-canvas');
    const maxX = arena ? arena.clientWidth - 70 : 250;
    const maxY = arena ? arena.clientHeight - 70 : 150;

    crashTickInterval = setInterval(() => {
        let increment = 0.01 + (currentMultiplier * 0.001);
        currentMultiplier += increment;
        
        if (display) display.innerText = currentMultiplier.toFixed(2) + 'x';
        
        // Плавное вычисление координат полета на основе множителя
        let progress = Math.min((currentMultiplier - 1.00) / 3.0, 1.0); 
        let currentX = progress * maxX;
        let currentY = progress * maxY; 
        
        if (rocket) {
            // Эмуляция дуги взлета через CSS
            rocket.style.transform = `translate(${currentX}px, -${currentY}px)`;
        }
        
        if (hasPlacedBet && !hasCashedOut) {
            const btn = document.getElementById('btn-crash-action');
            if (btn) btn.innerText = `Забрать ${(Math.floor(userBetAmount * currentMultiplier))} 💎`;
        }

        if (currentMultiplier >= targetCrashPoint) {
            clearInterval(crashTickInterval);
            executeCrash(currentX, currentY);
        }
    }, 50);
}

function executeCrash(finalX, finalY) {
    const display = document.getElementById('crash-multiplier');
    const rocket = document.getElementById('crash-rocket');
    const explosion = document.getElementById('crash-explosion');
    
    if (display) {
        display.classList.add('crashed');
        display.innerText = `Crash @ ${currentMultiplier.toFixed(2)}x`;
    }
    
    // Прячем ракету и взрываем ее в актуальных координатах
    if (rocket) rocket.style.display = "none";
    if (explosion) {
        explosion.style.left = (finalX + 35) + "px";
        explosion.style.bottom = (finalY + 35) + "px";
        explosion.classList.add('active');
    }
    
    // Запись в историю личных и общих игр
    if (hasPlacedBet) {
        const isWin = hasCashedOut;
        addLocalGameHistory('crash', isWin, isWin ? Math.floor(userBetAmount * currentMultiplier) : userBetAmount);
    }
    
    globalCrashHistory.unshift(parseFloat(currentMultiplier.toFixed(2)));
    if (globalCrashHistory.length > 15) globalCrashHistory.pop();
    renderGlobalCrashRibbon();
    
    hasPlacedBet = false;
    updateCrashButtonUI();
    
    setTimeout(() => {
        startWaitingPhase();
    }, 3000);
}

window.toggleCrash = function() {
    const btn = document.getElementById('btn-crash-action');
    
    if (crashState === CRASH_STATES.WAITING) {
        if (!hasPlacedBet) {
            const betInput = document.getElementById('crash-bet');
            const bet = parseInt(betInput.value);
            
            if (isNaN(bet) || bet <= 0 || bet > window.user.balance) {
                return alert('Недостаточно средств или неверная ставка');
            }
            
            userBetAmount = bet;
            window.user.balance -= userBetAmount;
            hasPlacedBet = true;
            window.updateBalanceUI();
            
            btn.innerText = 'Ставка принята';
            btn.style.opacity = '0.7';
        }
        return;
    }
    
    if (crashState === CRASH_STATES.LIVE) {
        if (hasPlacedBet && !hasCashedOut) {
            hasCashedOut = true;
            const winAmount = Math.floor(userBetAmount * currentMultiplier);
            window.user.balance += winAmount;
            window.user.stats.wonGames++;
            
            window.updateBalanceUI();
            window.updateStatsUI();
            
            btn.innerText = `Вы забрали: ${winAmount} 💎`;
            btn.style.opacity = '0.5';
        }
    }
};

function renderGlobalCrashRibbon() {
    const ribbon = document.getElementById('crash-global-history');
    if (!ribbon) return;
    ribbon.innerHTML = '';
    globalCrashHistory.forEach(mult => {
        let classColor = 'badge-gray';
        if (mult >= 2.0 && mult < 10.0) classColor = 'badge-cyan';
        if (mult >= 10.0) classColor = 'badge-purple';
        ribbon.innerHTML += `<div class="history-badge ${classColor}">${mult.toFixed(2)}x</div>`;
    });
}

function updateCrashButtonUI() {
    const btn = document.getElementById('btn-crash-action');
    if (!btn) return;
    
    btn.style.opacity = '1';
    
    if (crashState === CRASH_STATES.WAITING) {
        btn.disabled = false;
        btn.innerText = 'Сделать ставку';
        btn.className = 'btn btn-neon-cyan mt-10 w-100';
    } 
    else if (crashState === CRASH_STATES.LIVE) {
        if (hasPlacedBet && !hasCashedOut) {
            btn.disabled = false;
            btn.innerText = 'Забрать';
            btn.className = 'btn btn-neon-purple mt-10 w-100';
        } else if (hasCashedOut) {
            btn.disabled = true;
            btn.className = 'btn btn-neon-cyan mt-10 w-100';
            btn.style.opacity = '0.5';
        } else {
            btn.disabled = true;
            btn.innerText = 'Идет раунд...';
            btn.className = 'btn btn-neon-cyan mt-10 w-100';
            btn.style.opacity = '0.4';
        }
    }
}