import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { AvatarFrame } from '../shared/AvatarFrame';
import { CoinDisplay } from '../shared/CoinDisplay';
import { GlassCard } from '../shared/GlassCard';
import { ProgressBar } from '../shared/ProgressBar';
import { FRAME_CONFIG } from '../shared/AvatarFrame';
import {
  generateReferralLink,
  formatCoins,
} from '../../utils/format';
import {
  getReferralProgress,
  getNextMilestone,
  getInvestmentRate,
} from '../../utils/referrals';

const TOP_UP_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export function ProfilePage() {
  const {
    username,
    avatar,
    balance,
    referrals,
    topUp,
    addReferral,
    getRankFrame,
    investmentRate,
  } = useAppStore();

  const [showTopUp, setShowTopUp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const rankFrame = getRankFrame();
  const rate = investmentRate();
  const referralLink = generateReferralLink(username);
  const milestones = getReferralProgress(referrals);
  const nextMilestone = getNextMilestone(referrals);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTopUp = (amount: number) => {
    topUp(amount);
    setShowTopUp(false);
    setCustomAmount('');
  };

  return (
    <div className="page profile-page">
      <header className="profile-page__header">
        <div className="profile-page__avatar-section">
          <AvatarFrame
            avatar={avatar}
            frame={rankFrame}
            size="xl"
            showBadge={rankFrame !== 'none'}
          />
          {rankFrame !== 'none' && (
            <span className={`profile-page__rank-tag ${FRAME_CONFIG[rankFrame].className}-tag`}>
              {FRAME_CONFIG[rankFrame].badge} Топ {rankFrame === 'gold' ? '1' : rankFrame === 'silver' ? '2' : '3'}
            </span>
          )}
        </div>
        <h1 className="profile-page__name">{username}</h1>
        <p className="profile-page__subtitle">Игрок Neon Hub</p>
      </header>

      <GlassCard glow="cyan" className="profile-page__balance-card">
        <div className="profile-page__balance-header">
          <span className="label">Основной баланс</span>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => setShowTopUp(true)}
          >
            + Пополнить
          </button>
        </div>
        <CoinDisplay value={balance} className="profile-page__balance" />
        <div className="profile-page__rate-chip">
          Ставка инвестиций: <strong>{rate}%</strong>
        </div>
      </GlassCard>

      <GlassCard className="profile-page__referrals">
        <h2 className="section-title">Реферальная программа</h2>
        <div className="profile-page__ref-stats">
          <div className="stat-pill">
            <span className="stat-pill__value">{referrals}</span>
            <span className="stat-pill__label">рефералов</span>
          </div>
          <div className="stat-pill stat-pill--accent">
            <span className="stat-pill__value">{rate}%</span>
            <span className="stat-pill__label">текущий %</span>
          </div>
        </div>

        <div className="referral-link">
          <input readOnly value={referralLink} className="referral-link__input" />
          <button type="button" className="btn btn--ghost" onClick={handleCopy}>
            {copied ? '✓' : 'Копировать'}
          </button>
        </div>

        <div className="milestones">
          {milestones.map((m) => (
            <div
              key={m.refs}
              className={`milestone ${m.unlocked ? 'milestone--done' : ''}`}
            >
              <div className="milestone__header">
                <span>{m.unlocked ? '✓' : '○'} {m.label}</span>
                <span className="milestone__rate">
                  {m.unlocked ? `${rate}%` : `→ ${getInvestmentRate(m.refs)}%`}
                </span>
              </div>
              {!m.unlocked && (
                <ProgressBar value={m.progress} color="var(--accent-purple)" />
              )}
            </div>
          ))}
        </div>

        {nextMilestone && (
          <p className="profile-page__hint">
            Ещё {nextMilestone.remaining} реф. до {nextMilestone.nextRate}%
          </p>
        )}

        <button type="button" className="btn btn--outline btn--full" onClick={addReferral}>
          + Симулировать реферала (демо)
        </button>
      </GlassCard>

      <AnimatePresence>
        {showTopUp && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTopUp(false)}
          >
            <motion.div
              className="modal"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Пополнение баланса</h3>
              <p className="modal__sub">Текущий баланс: {formatCoins(balance)} 🪙</p>
              <div className="chip-grid">
                {TOP_UP_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className="chip-btn"
                    onClick={() => handleTopUp(amt)}
                  >
                    +{formatCoins(amt)}
                  </button>
                ))}
              </div>
              <div className="modal__custom">
                <input
                  type="number"
                  placeholder="Своя сумма"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="input"
                />
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => handleTopUp(Number(customAmount))}
                  disabled={!customAmount || Number(customAmount) <= 0}
                >
                  OK
                </button>
              </div>
              <button type="button" className="btn btn--ghost btn--full" onClick={() => setShowTopUp(false)}>
                Закрыть
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
