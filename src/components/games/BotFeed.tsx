import { useAppStore } from '../../store/useAppStore';
import { GAME_LABELS } from '../../utils/bots';
import { formatCoins } from '../../utils/format';

export function BotFeed() {
  const botFeed = useAppStore((s) => s.botFeed);

  return (
    <div className="bot-feed">
      <div className="bot-feed__label">
        <span className="live-dot" /> Live
      </div>
      <div className="bot-feed__track">
        {botFeed.length === 0 ? (
          <span className="bot-feed__empty">Ожидание игроков...</span>
        ) : (
          botFeed.map((b) => (
            <div key={b.id} className="bot-feed__item">
              <span className="bot-feed__avatar">{b.avatar}</span>
              <span className="bot-feed__name">{b.username}</span>
              <span className="bot-feed__game">{GAME_LABELS[b.game]}</span>
              <span className="bot-feed__bet">{formatCoins(b.bet)}</span>
              <span className="bot-feed__action">{b.action}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
