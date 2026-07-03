window.playCoinFlip = function(choice) {
    const bet = parseInt(document.getElementById('coin-bet').value);
    if (bet > window.user.balance || bet <= 0) return alert('Проверьте баланс');

    window.user.balance -= bet;
    window.user.stats.totalGames++;
    window.updateBalanceUI();
    window.updateStatsUI();

    const visual = document.getElementById('coin-visual');
    visual.classList.add('spin');
    visual.innerHTML = '<i class="fa-solid fa-atom"></i>';
    visual.style.color = 'var(--text)';

    setTimeout(() => {
        visual.classList.remove('spin');
        const isHeads = Math.random() > 0.5;
        const result = isHeads ? 'heads' : 'tails';
        const isWin = choice === result;

        visual.innerHTML = isHeads ? '<i class="fa-solid fa-circle-up"></i>' : '<i class="fa-solid fa-circle-down"></i>';
        
        if (isWin) {
            window.user.balance += bet * 2;
            window.user.stats.wonGames++;
            window.updateBalanceUI();
            window.updateStatsUI();
            visual.style.color = 'var(--cyan)';
            visual.style.textShadow = 'var(--cyan-glow)';
        } else {
            visual.style.color = 'var(--danger)';
            visual.style.textShadow = '0 0 15px var(--danger)';
        }
        
        window.addLocalGameHistory('coinflip', isWin, isWin ? (bet * 2) : bet);

        setTimeout(() => { 
            visual.style.color = 'var(--purple)'; 
            visual.style.textShadow = 'var(--purple-glow)'; 
            visual.innerHTML = '<i class="fa-solid fa-meteor"></i>'; 
        }, 1500);
    }, 800);
};