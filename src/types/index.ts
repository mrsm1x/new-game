export type TabId = 'profile' | 'investment' | 'games' | 'leaderboard';

export type RankFrame = 'none' | 'bronze' | 'silver' | 'gold';

export type GameId = 'crash' | 'mines' | 'coin';

export interface Player {
  id: string;
  username: string;
  avatar: string;
  balance: number;
  totalCoins: number;
  referrals: number;
  rankFrame: RankFrame;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  totalCoins: number;
  rank: number;
  rankFrame: RankFrame;
}

export interface BotActivity {
  id: string;
  username: string;
  avatar: string;
  game: GameId;
  action: string;
  bet: number;
  result?: string;
  timestamp: number;
}

export interface InvestmentRecord {
  amount: number;
  rate: number;
  profit: number;
  timestamp: number;
}
