import { useAppStore } from './store/useAppStore';
import { BottomNav } from './components/layout/BottomNav';
import { ProfilePage } from './components/profile/ProfilePage';
import { InvestmentPage } from './components/investment/InvestmentPage';
import { GamesPage } from './components/games/GamesPage';
import { LeaderboardPage } from './components/leaderboard/LeaderboardPage';

function App() {
  const activeTab = useAppStore((s) => s.activeTab);

  return (
    <div className="app">
      <div className="app__bg" aria-hidden />
      <main className="app__content">
        {activeTab === 'profile' && <ProfilePage />}
        {activeTab === 'investment' && <InvestmentPage />}
        {activeTab === 'games' && <GamesPage />}
        {activeTab === 'leaderboard' && <LeaderboardPage />}
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
