import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { GlassCard } from '../shared/GlassCard';
import { formatMultiplier, formatCoins } from '../../utils/format';

const GRID = 5;
const BET_PRESETS = [50, 100, 250, 500, 1000];
const MINE_OPTIONS = [3, 5, 8, 12];

type CellState = 'hidden' | 'gem' | 'mine';

function calcMultiplier(revealed: number, mines: number): number {
  const total = GRID * GRID;
  const safe = total - mines;
  let mult = 1;
  for (let i = 0; i < revealed; i++) {
    mult *= (total - i) / (safe - i);
  }
  return mult;
}

function generateMinePositions(count: number): Set<number> {
  const set = new Set<number>();
  while (set.size < count) set.add(Math.floor(Math.random() * GRID * GRID));
  return set;
}

export function MinesGame() {
  const { balance, adjustBalance, pushBotActivity } = useAppStore();
  const [bet, setBet] = useState(100);
  const [mines, setMines] = useState(5);
  const [playing, setPlaying] = useState(false);
  const [mineSet, setMineSet] = useState<Set<number>>(new Set());
  const [cells, setCells] = useState<CellState[]>(Array(GRID * GRID).fill('hidden'));
  const [revealed, setRevealed] = useState(0);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);

  const multiplier = useMemo(
    () => (revealed > 0 ? calcMultiplier(revealed, mines) : 1),
    [revealed, mines],
  );

  const potentialWin = Math.floor(bet * multiplier);

  const reset = useCallback(() => {
    setPlaying(false);
    setMineSet(new Set());
    setCells(Array(GRID * GRID).fill('hidden'));
    setRevealed(0);
    setResult(null);
  }, []);

  const startGame = () => {
    if (bet <= 0 || bet > balance) return;
    adjustBalance(-bet);
    setMineSet(generateMinePositions(mines));
    setCells(Array(GRID * GRID).fill('hidden'));
    setRevealed(0);
    setPlaying(true);
    setResult(null);
  };

  const reveal = (idx: number) => {
    if (!playing || cells[idx] !== 'hidden') return;

    if (mineSet.has(idx)) {
      const next = [...cells];
      mineSet.forEach((m) => { next[m] = 'mine'; });
      next[idx] = 'mine';
      setCells(next);
      setPlaying(false);
      setResult('lose');
      pushBotActivity('mines');
      setTimeout(reset, 2000);
      return;
    }

    const next = [...cells];
    next[idx] = 'gem';
    setCells(next);
    setRevealed((r) => r + 1);
  };

  const cashOut = () => {
    if (!playing || revealed === 0) return;
    const win = potentialWin;
    adjustBalance(win);
    setPlaying(false);
    setResult('win');
    pushBotActivity('mines');
    setTimeout(reset, 2000);
  };

  return (
    <GlassCard glow="purple" className="mines-game">
      <div className="mines-game__header">
        <div className="mines-stat">
          <span className="label">Множитель</span>
          <span className="mines-stat__value">{formatMultiplier(multiplier)}</span>
        </div>
        <div className="mines-stat">
          <span className="label">Выигрыш</span>
          <span className="mines-stat__value text-green">{formatCoins(potentialWin)}</span>
        </div>
        <div className="mines-stat">
          <span className="label">Мины</span>
          <span className="mines-stat__value">💣 {mines}</span>
        </div>
      </div>

      <div className="mines-grid">
        {cells.map((state, i) => (
          <motion.button
            key={i}
            type="button"
            className={`mines-cell mines-cell--${state}`}
            disabled={!playing || state !== 'hidden'}
            onClick={() => reveal(i)}
            whileTap={{ scale: 0.92 }}
          >
            {state === 'gem' && '💎'}
            {state === 'mine' && '💥'}
            {state === 'hidden' && playing && <span className="mines-cell__dot" />}
          </motion.button>
        ))}
      </div>

      {result === 'win' && (
        <div className="mines-result mines-result--win">+{formatCoins(potentialWin - bet)}</div>
      )}
      {result === 'lose' && (
        <div className="mines-result mines-result--lose">−{formatCoins(bet)}</div>
      )}

      <div className="game-controls">
        {!playing ? (
          <>
            <div className="game-controls__row">
              <label className="label">Ставка</label>
              <div className="chip-grid chip-grid--sm">
                {BET_PRESETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`chip-btn ${bet === b ? 'chip-btn--active' : ''}`}
                    onClick={() => setBet(b)}
                  >
                    {formatCoins(b)}
                  </button>
                ))}
              </div>
            </div>
            <div className="game-controls__row">
              <label className="label">Кол-во мин</label>
              <div className="chip-grid chip-grid--sm">
                {MINE_OPTIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`chip-btn ${mines === m ? 'chip-btn--active' : ''}`}
                    onClick={() => setMines(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="btn btn--primary btn--full btn--lg"
              disabled={bet > balance}
              onClick={startGame}
            >
              Играть · {formatCoins(bet)}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn--cashout btn--full btn--lg"
            disabled={revealed === 0}
            onClick={cashOut}
          >
            Забрать {formatCoins(potentialWin)}
          </button>
        )}
      </div>
    </GlassCard>
  );
}
