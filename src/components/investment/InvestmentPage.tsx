import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { GlassCard } from '../shared/GlassCard';
import { CoinDisplay } from '../shared/CoinDisplay';
import { ProgressBar } from '../shared/ProgressBar';
import { formatTimeLeft, formatCoins } from '../../utils/format';
import { INVEST_COOLDOWN } from '../../store/useAppStore';

const QUICK_AMOUNTS = [100, 500, 1000, 2500, 5000, 10000];

export function InvestmentPage() {
  const {
    balance,
    referrals,
    investmentRate,
    invest,
    canInvest,
    investCooldownLeft,
    investmentHistory,
  } = useAppStore();

  const [amount, setAmount] = useState('1000');
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [cooldown, setCooldown] = useState(investCooldownLeft());

  const rate = investmentRate();
  const numAmount = Number(amount) || 0;
  const projectedProfit = Math.floor(numAmount * (rate / 100));
  const projectedTotal = numAmount + projectedProfit;
  const ready = canInvest();
  const progress = ready ? 100 : ((INVEST_COOLDOWN - cooldown) / INVEST_COOLDOWN) * 100;

  useEffect(() => {
    const id = setInterval(() => setCooldown(investCooldownLeft()), 1000);
    return () => clearInterval(id);
  }, [investCooldownLeft]);

  const handleInvest = () => {
    const result = invest(numAmount);
    setMessage({ text: result.message, ok: result.ok });
    if (result.ok) setAmount('1000');
    setTimeout(() => setMessage(null), 3500);
  };

  return (
    <div className="page investment-page">
      <header className="page-header">
        <h1>Инвестиции</h1>
        <p>Раз в 24 часа — депозит с основного баланса под ваш %</p>
      </header>

      <GlassCard glow="purple" className="invest-card">
        <div className="invest-card__rate">
          <span className="invest-card__rate-label">Ваша ставка</span>
          <motion.span
            key={rate}
            className="invest-card__rate-value"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {rate}%
          </motion.span>
        </div>
        <p className="invest-card__desc">
          Базовый 4% + бонусы за {referrals} рефералов. Сумма умножается на {rate}% — прибыль зачисляется мгновенно.
        </p>
        <div className="invest-card__formula">
          <span>{formatCoins(numAmount)}</span>
          <span>× {rate}%</span>
          <span>= +{formatCoins(projectedProfit)}</span>
        </div>
      </GlassCard>

      <GlassCard className="invest-timer">
        <div className="invest-timer__header">
          <span>{ready ? '✓ Доступно' : '⏳ До следующей инвестиции'}</span>
          {!ready && <span className="invest-timer__time">{formatTimeLeft(cooldown)}</span>}
        </div>
        <ProgressBar
          value={progress}
          color={ready ? 'var(--accent-green)' : 'var(--accent-purple)'}
          height={8}
        />
      </GlassCard>

      <GlassCard className="invest-form">
        <label className="label">Сумма депозита</label>
        <div className="invest-form__input-row">
          <input
            type="number"
            className="input input--lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
            max={balance}
          />
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setAmount(String(balance))}
          >
            MAX
          </button>
        </div>

        <div className="chip-grid">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              className={`chip-btn ${numAmount === a ? 'chip-btn--active' : ''}`}
              onClick={() => setAmount(String(a))}
            >
              {formatCoins(a)}
            </button>
          ))}
        </div>

        <div className="invest-form__preview">
          <div>
            <span className="label">Баланс после</span>
            <CoinDisplay value={balance - numAmount + projectedTotal} />
          </div>
          <div>
            <span className="label">Прибыль</span>
            <span className="text-green">+{formatCoins(projectedProfit)}</span>
          </div>
        </div>

        {message && (
          <div className={`toast ${message.ok ? 'toast--ok' : 'toast--err'}`}>
            {message.text}
          </div>
        )}

        <button
          type="button"
          className="btn btn--primary btn--full btn--lg"
          disabled={!ready || numAmount <= 0 || numAmount > balance}
          onClick={handleInvest}
        >
          {ready ? `Инвестировать ${formatCoins(numAmount)}` : 'Ожидание...'}
        </button>
      </GlassCard>

      {investmentHistory.length > 0 && (
        <GlassCard className="invest-history">
          <h2 className="section-title">История</h2>
          <ul className="history-list">
            {investmentHistory.map((h, i) => (
              <li key={i} className="history-list__item">
                <span>{new Date(h.timestamp).toLocaleString('ru-RU')}</span>
                <span>{formatCoins(h.amount)} → +{formatCoins(h.profit)} ({h.rate}%)</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}
