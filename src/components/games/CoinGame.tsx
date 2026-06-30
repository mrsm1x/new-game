import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { GlassCard } from '../shared/GlassCard';
import { formatCoins } from '../../utils/format';

type Side = 'heads' | 'tails';
type Phase = 'idle' | 'flipping' | 'done';

const BET_PRESETS = [25, 50, 100, 250, 500, 1000, 2500];
const MULTIPLIER = 1.96;

const SIDE_LABEL: Record<Side, string> = {
  heads: 'Орёл',
  tails: 'Решка',
};

const SIDE_EMOJI: Record<Side, string> = {
  heads: '🦅',
  tails: '🌿',
};

export function CoinGame() {
  const { balance, adjustBalance, pushBotActivity } = useAppStore();
  const [bet, setBet] = useState(100);
  const [choice, setChoice] = useState<Side>('heads');
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<Side | null>(null);
  const [won, setWon] = useState(false);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<{ side: Side; won: boolean }[]>([]);

  const flip = () => {
    if (bet <= 0 || bet > balance || phase !== 'idle') return;
    adjustBalance(-bet);
    setPhase('flipping');
    setResult(null);

    const outcome: Side = Math.random() > 0.5 ? 'heads' : 'tails';
    const isWin = outcome === choice;

    setTimeout(() => {
      setResult(outcome);
      setWon(isWin);
      setPhase('done');

      if (isWin) {
        const win = Math.floor(bet * MULTIPLIER);
        adjustBalance(win);
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }

      setHistory((h) => [{ side: outcome, won: isWin }, ...h].slice(0, 12));
      pushBotActivity('coin');

      setTimeout(() => {
        setPhase('idle');
        setResult(null);
      }, 2200);
    }, 1400);
  };

  return (
    <GlassCard glow="gold" className="coin-game">
      <div className="coin-game__stats">
        <div className="coin-stat">
          <span className="label">Множитель</span>
          <span>{MULTIPLIER}×</span>
        </div>
        <div className="coin-stat">
          <span className="label">Серия</span>
          <span className={streak >= 3 ? 'text-gold' : ''}>🔥 {streak}</span>
        </div>
      </div>

      <div className="coin-stage">
        <motion.div
          className="coin"
          animate={
            phase === 'flipping'
              ? { rotateY: [0, 1800], y: [0, -40, 0] }
              : { rotateY: result === 'tails' ? 180 : 0, y: 0 }
          }
          transition={{ duration: phase === 'flipping' ? 1.4 : 0.3 }}
        >
          <div className="coin__face coin__face--front">{SIDE_EMOJI.heads}</div>
          <div className="coin__face coin__face--back">{SIDE_EMOJI.tails}</div>
        </motion.div>

        <AnimatePresence>
          {phase === 'done' && result && (
            <motion.div
              className={`coin-result ${won ? 'coin-result--win' : 'coin-result--lose'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {won
                ? `+${formatCoins(Math.floor(bet * MULTIPLIER) - bet)}`
                : `−${formatCoins(bet)}`}
              <span>{SIDE_LABEL[result]}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="coin-choice">
        {(['heads', 'tails'] as Side[]).map((side) => (
          <button
            key={side}
            type="button"
            className={`coin-choice__btn ${choice === side ? 'coin-choice__btn--active' : ''}`}
            disabled={phase !== 'idle'}
            onClick={() => setChoice(side)}
          >
            <span>{SIDE_EMOJI[side]}</span>
            {SIDE_LABEL[side]}
          </button>
        ))}
      </div>

      <div className="game-controls">
        <div className="chip-grid chip-grid--sm">
          {BET_PRESETS.map((b) => (
            <button
              key={b}
              type="button"
              className={`chip-btn ${bet === b ? 'chip-btn--active' : ''}`}
              disabled={phase !== 'idle'}
              onClick={() => setBet(b)}
            >
              {formatCoins(b)}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn--primary btn--full btn--lg"
          disabled={phase !== 'idle' || bet > balance}
          onClick={flip}
        >
          {phase === 'flipping' ? 'Бросок...' : `Подбросить · ${formatCoins(bet)}`}
        </button>
      </div>

      {history.length > 0 && (
        <div className="coin-history">
          {history.map((h, i) => (
            <span
              key={i}
              className={`coin-history__item ${h.won ? 'coin-history__item--win' : 'coin-history__item--lose'}`}
            >
              {SIDE_EMOJI[h.side]}
            </span>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
