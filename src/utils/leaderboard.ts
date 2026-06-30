import type { LeaderboardEntry, RankFrame } from '../types';

const MOCK_PLAYERS = [
  { username: 'DiamondKing', avatar: '👑', totalCoins: 284_500 },
  { username: 'PlatinumAce', avatar: '💎', totalCoins: 198_200 },
  { username: 'GoldRush', avatar: '🏆', totalCoins: 156_800 },
  { username: 'SilverBolt', avatar: '⚡', totalCoins: 92_400 },
  { username: 'BronzeWolf', avatar: '🐺', totalCoins: 67_300 },
  { username: 'NeonPulse', avatar: '🔮', totalCoins: 45_100 },
  { username: 'StarMiner', avatar: '⭐', totalCoins: 38_600 },
  { username: 'VoidBet', avatar: '🌑', totalCoins: 29_400 },
  { username: 'LuckyFox', avatar: '🦊', totalCoins: 22_800 },
  { username: 'CryptoKid', avatar: '🎮', totalCoins: 18_500 },
  { username: 'MoonFlip', avatar: '🌙', totalCoins: 14_200 },
  { username: 'TurboAce', avatar: '🚀', totalCoins: 11_900 },
];

function frameForRank(rank: number): RankFrame {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return 'none';
}

export function buildLeaderboard(
  userId: string,
  username: string,
  avatar: string,
  totalCoins: number,
): LeaderboardEntry[] {
  const all = [
    ...MOCK_PLAYERS.map((p, i) => ({
      id: `mock-${i}`,
      ...p,
    })),
    { id: userId, username, avatar, totalCoins },
  ]
    .sort((a, b) => b.totalCoins - a.totalCoins)
    .map((p, i) => ({
      ...p,
      rank: i + 1,
      rankFrame: frameForRank(i + 1),
    }));

  return all;
}

export function getUserRankFrame(
  leaderboard: LeaderboardEntry[],
  userId: string,
): RankFrame {
  return leaderboard.find((e) => e.id === userId)?.rankFrame ?? 'none';
}
