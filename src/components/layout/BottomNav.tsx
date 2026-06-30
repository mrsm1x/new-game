import { useAppStore } from '../../store/useAppStore';
import type { TabId } from '../../types';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'profile', label: 'Профиль', icon: '👤' },
  { id: 'investment', label: 'Инвест', icon: '📈' },
  { id: 'games', label: 'Игры', icon: '🎰' },
  { id: 'leaderboard', label: 'Топ', icon: '🏆' },
];

export function BottomNav() {
  const { activeTab, setTab } = useAppStore();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav__inner">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`bottom-nav__item ${activeTab === tab.id ? 'bottom-nav__item--active' : ''}`}
            onClick={() => setTab(tab.id)}
          >
            <span className="bottom-nav__icon">{tab.icon}</span>
            <span className="bottom-nav__label">{tab.label}</span>
            {activeTab === tab.id && <span className="bottom-nav__indicator" />}
          </button>
        ))}
      </div>
    </nav>
  );
}
