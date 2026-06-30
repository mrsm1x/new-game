import { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { GameId } from '../../types';
import { CrashGame } from '../games/CrashGame';
import { MinesGame } from '../games/MinesGame';
import { CoinGame } from '../games/CoinGame';
import { BotFeed } from '../games/BotFeed';

const GAMES: { id: GameId; name: string; icon: string; desc: string }[] = [
  { id: 'crash', name: 'Краш', icon: '🚀', desc: 'Забери до обвала' },
  { id: 'mines', name: 'Мины', icon: '💎', desc: 'Сапёр с множителем' },
  { id: 'coin', name: 'Монетка', icon: '🪙', desc: 'Орёл или решка' },
];

export function GamesPage() {
  const { selectedGame, setSelectedGame, tickBots, pushBotActivity } = useAppStore();

  useEffect(() => {
    pushBotActivity('crash');
    pushBotActivity('mines');
    pushBotActivity('coin');
    const id = setInterval(() => tickBots(), 2800);
    return () => clearInterval(id);
  }, [tickBots, pushBotActivity]);

  return (
    <div className="page games-page">
      <header className="page-header">
        <h1>Игровой зал</h1>
        <p>Ставки с основного баланса · Live-лента игроков</p>
      </header>

      <div className="game-tabs">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`game-tab ${selectedGame === g.id ? 'game-tab--active' : ''}`}
            onClick={() => setSelectedGame(g.id)}
          >
            <span className="game-tab__icon">{g.icon}</span>
            <span className="game-tab__name">{g.name}</span>
            <span className="game-tab__desc">{g.desc}</span>
          </button>
        ))}
      </div>

      <BotFeed />

      <div className="game-area">
        {selectedGame === 'crash' && <CrashGame />}
        {selectedGame === 'mines' && <MinesGame />}
        {selectedGame === 'coin' && <CoinGame />}
      </div>
    </div>
  );
}
