import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BotActivity, GameId, InvestmentRecord, TabId } from '../types';
import { createBotActivity } from '../utils/bots';
import { getInvestmentRate } from '../utils/referrals';
import {
  buildLeaderboard,
  getUserRankFrame,
} from '../utils/leaderboard';

const INVEST_COOLDOWN = 24 * 60 * 60 * 1000;
const USER_ID = 'player-main';

interface AppState {
  activeTab: TabId;
  username: string;
  avatar: string;
  balance: number;
  totalCoins: number;
  referrals: number;
  lastInvestmentAt: number | null;
  investmentHistory: InvestmentRecord[];
  botFeed: BotActivity[];
  selectedGame: GameId;

  setTab: (tab: TabId) => void;
  setSelectedGame: (game: GameId) => void;
  topUp: (amount: number) => void;
  adjustBalance: (delta: number) => void;
  addReferral: () => void;
  invest: (amount: number) => { ok: boolean; message: string };
  canInvest: () => boolean;
  investCooldownLeft: () => number;
  investmentRate: () => number;
  getLeaderboard: () => ReturnType<typeof buildLeaderboard>;
  getRankFrame: () => ReturnType<typeof getUserRankFrame>;
  pushBotActivity: (game: GameId) => void;
  tickBots: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: 'profile',
      username: 'NeonPlayer',
      avatar: '🎮',
      balance: 10_000,
      totalCoins: 10_000,
      referrals: 2,
      lastInvestmentAt: null,
      investmentHistory: [],
      botFeed: [],
      selectedGame: 'crash',

      setTab: (tab) => set({ activeTab: tab }),
      setSelectedGame: (game) => set({ selectedGame: game }),

      topUp: (amount) => {
        if (amount <= 0) return;
        set((s) => ({
          balance: s.balance + amount,
          totalCoins: s.totalCoins + amount,
        }));
      },

      adjustBalance: (delta) => {
        set((s) => ({
          balance: Math.max(0, s.balance + delta),
          totalCoins: Math.max(0, s.totalCoins + Math.max(0, delta)),
        }));
      },

      addReferral: () => set((s) => ({ referrals: s.referrals + 1 })),

      investmentRate: () => getInvestmentRate(get().referrals),

      canInvest: () => {
        const { lastInvestmentAt } = get();
        if (!lastInvestmentAt) return true;
        return Date.now() - lastInvestmentAt >= INVEST_COOLDOWN;
      },

      investCooldownLeft: () => {
        const { lastInvestmentAt } = get();
        if (!lastInvestmentAt) return 0;
        const left = INVEST_COOLDOWN - (Date.now() - lastInvestmentAt);
        return Math.max(0, left);
      },

      invest: (amount) => {
        const state = get();
        if (amount <= 0) return { ok: false, message: 'Введите сумму' };
        if (amount > state.balance)
          return { ok: false, message: 'Недостаточно средств' };
        if (!state.canInvest())
          return { ok: false, message: 'Инвестиция доступна раз в 24 часа' };

        const rate = state.investmentRate();
        const profit = Math.floor(amount * (rate / 100));
        const totalReturn = amount + profit;

        set({
          balance: state.balance - amount + totalReturn,
          totalCoins: state.totalCoins + profit,
          lastInvestmentAt: Date.now(),
          investmentHistory: [
            {
              amount,
              rate,
              profit,
              timestamp: Date.now(),
            },
            ...state.investmentHistory.slice(0, 19),
          ],
        });

        return {
          ok: true,
          message: `+${profit} монет (${rate}% от ${amount})`,
        };
      },

      getLeaderboard: () => {
        const s = get();
        return buildLeaderboard(USER_ID, s.username, s.avatar, s.totalCoins);
      },

      getRankFrame: () => {
        const s = get();
        return getUserRankFrame(
          buildLeaderboard(USER_ID, s.username, s.avatar, s.totalCoins),
          USER_ID,
        );
      },

      pushBotActivity: (game) => {
        const activity = createBotActivity(game);
        set((s) => ({
          botFeed: [activity, ...s.botFeed].slice(0, 30),
        }));
      },

      tickBots: () => {
        const games: GameId[] = ['crash', 'mines', 'coin'];
        const game = games[Math.floor(Math.random() * games.length)];
        get().pushBotActivity(game);
      },
    }),
    {
      name: 'neon-player-hub',
      partialize: (s) => ({
        username: s.username,
        avatar: s.avatar,
        balance: s.balance,
        totalCoins: s.totalCoins,
        referrals: s.referrals,
        lastInvestmentAt: s.lastInvestmentAt,
        investmentHistory: s.investmentHistory,
      }),
    },
  ),
);

export { USER_ID, INVEST_COOLDOWN };
