import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { AvatarFrame, FRAME_CONFIG } from '../shared/AvatarFrame';
import { GlassCard } from '../shared/GlassCard';
import { formatCoins } from '../../utils/format';
import { USER_ID } from '../../store/useAppStore';
import { buildLeaderboard } from '../../utils/leaderboard';

export function LeaderboardPage() {
  const username = useAppStore((s) => s.username);
  const avatar = useAppStore((s) => s.avatar);
  const totalCoins = useAppStore((s) => s.totalCoins);
  const leaderboard = useMemo(
    () => buildLeaderboard(USER_ID, username, avatar, totalCoins),
    [username, avatar, totalCoins],
  );
  const userEntry = leaderboard.find((e) => e.id === USER_ID);

  return (
    <div className="page leaderboard-page">
      <header className="page-header">
        <h1>Топ игроков</h1>
        <p>Рейтинг по общему количеству монет</p>
      </header>

      {userEntry && (
        <GlassCard glow="cyan" className="leaderboard-you">
          <span className="label">Ваша позиция</span>
          <div className="leaderboard-you__row">
            <span className="leaderboard-rank">#{userEntry.rank}</span>
            <AvatarFrame
              avatar={userEntry.avatar}
              frame={userEntry.rankFrame}
              size="sm"
              showBadge
            />
            <span className="leaderboard-you__name">{userEntry.username}</span>
            <span className="leaderboard-you__coins">{formatCoins(userEntry.totalCoins)} 🪙</span>
          </div>
        </GlassCard>
      )}

      <div className="podium">
        {leaderboard.slice(0, 3).map((_entry, i) => {
          const order = [1, 0, 2][i];
          const e = leaderboard[order];
          if (!e) return null;
          const heights = ['podium__place--1', 'podium__place--2', 'podium__place--3'];
          return (
            <div key={e.id} className={`podium__place ${heights[i]}`}>
              <AvatarFrame
                avatar={e.avatar}
                frame={e.rankFrame}
                size={order === 0 ? 'lg' : 'md'}
                showBadge
              />
              <span className="podium__name">{e.username}</span>
              <span className="podium__coins">{formatCoins(e.totalCoins)}</span>
              <span className="podium__rank">{FRAME_CONFIG[e.rankFrame].badge}</span>
            </div>
          );
        })}
      </div>

      <GlassCard className="leaderboard-list">
        {leaderboard.map((entry) => (
          <div
            key={entry.id}
            className={`leaderboard-row ${entry.id === USER_ID ? 'leaderboard-row--you' : ''} ${entry.rank <= 3 ? `leaderboard-row--top${entry.rank}` : ''}`}
          >
            <span className="leaderboard-row__rank">
              {entry.rank <= 3 ? FRAME_CONFIG[entry.rankFrame].badge : `#${entry.rank}`}
            </span>
            <AvatarFrame
              avatar={entry.avatar}
              frame={entry.rankFrame}
              size="sm"
              showBadge={entry.rank <= 3}
            />
            <div className="leaderboard-row__info">
              <span className="leaderboard-row__name">
                {entry.username}
                {entry.id === USER_ID && ' (вы)'}
              </span>
              {entry.rank <= 3 && (
                <span className={`leaderboard-row__frame-tag ${FRAME_CONFIG[entry.rankFrame].className}-tag`}>
                  {FRAME_CONFIG[entry.rankFrame].label} рамка
                </span>
              )}
            </div>
            <span className="leaderboard-row__coins">{formatCoins(entry.totalCoins)} 🪙</span>
          </div>
        ))}
      </GlassCard>

      <GlassCard className="frame-info">
        <h2 className="section-title">Рамки профиля</h2>
        <p className="frame-info__text">
          Топ-3 игрока получают эксклюзивные рамки, отображаемые в профиле. Чем выше место — тем роскошнее оформление.
        </p>
        <div className="frame-showcase">
          {(['gold', 'silver', 'bronze'] as const).map((f) => (
            <div key={f} className="frame-showcase__item">
              <AvatarFrame avatar="🎮" frame={f} size="md" showBadge />
              <span>{FRAME_CONFIG[f].label}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
