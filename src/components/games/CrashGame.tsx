import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { GlassCard } from '../shared/GlassCard';
import { formatMultiplier, formatCoins } from '../../utils/format';

type Phase = 'idle' | 'running' | 'crashed' | 'cashed';

const BET_PRESETS = [50, 100, 250, 500, 1000, 2500];
const HISTORY_SIZE = 8;

function generateCrashPoint(): number {
  const r = Math.random();
  if (r < 0.04) return 1 + Math.random() * 0.3;
  return Math.min(50, 1 + Math.pow(1 / (1 - r), 1.4) * 0.85);
}

export function CrashGame() {
  const { balance, adjustBalance, pushBotActivity } = useAppStore();
  const [bet, setBet] = useState(100);
  const [phase, setPhase] = useState<Phase>('idle');
  const [multiplier, setMultiplier] = useState(1);
  const [crashAt, setCrashAt] = useState(2);
  const [history, setHistory] = useState<number[]>([2.14, 1.08, 5.67, 1.32, 3.21, 1.05, 8.44, 2.01]);
  const [winAmount, setWinAmount] = useState(0);
  const [autoCashout, setAutoCashout] = useState('');
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);

  const running = phase === 'running';

  const stopLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const endRound = useCallback(
    (crashed: boolean, finalMult: number) => {
      stopLoop();
      setPhase(crashed ? 'crashed' : 'cashed');
      setMultiplier(finalMult);
      setHistory((h) => [finalMult, ...h].slice(0, HISTORY_SIZE));
      pushBotActivity('crash');
      setTimeout(() => {
        setPhase('idle');
        setMultiplier(1);
        setWinAmount(0);
      }, 2500);
    },
    [stopLoop, pushBotActivity],
  );

  const startRound = () => {
    if (bet <= 0 || bet > balance || phase !== 'idle') return;
    adjustBalance(-bet);
    const point = generateCrashPoint();
    setCrashAt(point);
    setPhase('running');
    setMultiplier(1);
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startRef.current) / 1000;
      const mult = 1 + elapsed * elapsed * 0.35 + elapsed * 0.12;
      setMultiplier(mult);

      const auto = Number(autoCashout);
      if (auto > 1 && mult >= auto) {
        const win = Math.floor(bet * auto);
        adjustBalance(win);
        setWinAmount(win - bet);
        endRound(false, auto);
        return;
      }

      if (mult >= point) {
        endRound(true, point);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const cashOut = () => {
    if (phase !== 'running') return;
    const win = Math.floor(bet * multiplier);
    adjustBalance(win);
    setWinAmount(win - bet);
    endRound(false, multiplier);
  };

  useEffect(() => () => stopLoop(), [stopLoop]);

  const rocketY = Math.min(85, multiplier * 12);

  return (
    <GlassCard glow="cyan" className="crash-game">
      <div className="crash-game__display">
        <div className="crash-history">
          {history.map((h, i) => (
            <span
              key={i}
              className={`crash-history__item ${h >= 2 ? 'crash-history__item--high' : h < 1.5 ? 'crash-history__item--low' : ''}`}
            >
              {h.toFixed(2)}×
            </span>
          ))}
        </div>

        <div className="crash-stage">
          <svg className="crash-stage__grid" viewBox="0 0 300 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="crashLine" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--accent-cyan)" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={i * 75} y1="0" x2={i * 75} y2="120" stroke="rgba(255,255,255,0.04)" />
            ))}
            <motion.path
              d={`M 0 110 Q ${multiplier * 20} ${110 - rocketY} ${multiplier * 35} ${110 - rocketY}`}
              fill="none"
              stroke="url(#crashLine)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          <AnimatePresence mode="wait">
            <motion.div
              key={phase + multiplier.toFixed(2)}
              className={`crash-multiplier ${phase === 'crashed' ? 'crash-multiplier--crash' : phase === 'cashed' ? 'crash-multiplier--win' : ''}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              {formatMultiplier(multiplier)}
            </motion.div>
          </AnimatePresence>

          <motion.div
            className="crash-rocket"
            animate={{ y: -rocketY, rotate: running ? [0, -8, 8, 0] : 0 }}
            transition={{ y: { duration: 0.1 }, rotate: { repeat: Infinity, duration: 0.4 } }}
          >
            🚀
          </motion.div>

          {phase === 'crashed' && (
            <motion.div
              className="crash-explosion"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
            >
              💥
            </motion.div>
          )}
        </div>

        {winAmount > 0 && phase === 'cashed' && (
          <div className="crash-win-banner">+{formatCoins(winAmount)}</div>
        )}
        {phase === 'crashed' && (
          <div className="crash-lose-banner">Краш на {crashAt.toFixed(2)}×</div>
        )}
      </div>

      <div className="game-controls">
        <div className="game-controls__row">
          <label className="label">Ставка</label>
          <div className="chip-grid chip-grid--sm">
            {BET_PRESETS.map((b) => (
              <button
                key={b}
                type="button"
                className={`chip-btn ${bet === b ? 'chip-btn--active' : ''}`}
                disabled={running}
                onClick={() => setBet(b)}
              >
                {formatCoins(b)}
              </button>
            ))}
          </div>
        </div>

        <div className="game-controls__row">
          <label className="label">Авто-вывод (×)</label>
          <input
            className="input"
            placeholder="2.00"
            value={autoCashout}
            onChange={(e) => setAutoCashout(e.target.value)}
            disabled={running}
          />
        </div>

        <div className="game-controls__actions">
          {!running ? (
            <button
              type="button"
              className="btn btn--primary btn--full btn--lg"
              disabled={phase !== 'idle' || bet > balance}
              onClick={startRound}
            >
              Старт · {formatCoins(bet)}
            </button>
          ) : (
            <button type="button" className="btn btn--cashout btn--full btn--lg" onClick={cashOut}>
              Забрать {formatCoins(Math.floor(bet * multiplier))}
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
