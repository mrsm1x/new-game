import type { BotActivity, GameId } from '../types';

const NAMES = [
  'NeonWolf', 'CryptoFox', 'StarPulse', 'VoidRider', 'LuckyAce',
  'MoonShard', 'BlazeKing', 'IceQueen', 'TurboBet', 'ShadowFlip',
  'GoldenRay', 'PixelLord', 'NovaStrike', 'DarkMint', 'SkyHunter',
  'RubyStorm', 'EchoMind', 'FlashBet', 'CosmoKid', 'IronLuck',
];

const AVATARS = ['🦊', '🐺', '🦁', '🐯', '🦅', '🐉', '🦄', '🐙', '🦈', '🐍', '🎭', '👾', '🤖', '💀', '🔥'];

const GAME_LABELS: Record<GameId, string> = {
  crash: 'Краш',
  mines: 'Мины',
  coin: 'Монетка',
};

let botCounter = 0;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createBotActivity(game: GameId): BotActivity {
  const bet = pick([50, 100, 250, 500, 1000, 2500, 5000]);
  const username = pick(NAMES);
  const actions: Record<GameId, () => string> = {
    crash: () => {
      const mult = (1.1 + Math.random() * 8).toFixed(2);
      return Math.random() > 0.35
        ? `забрал ${mult}× (+${Math.round(bet * (+mult - 1))})`
        : `краш на ${(1 + Math.random() * 2).toFixed(2)}×`;
    },
    mines: () => {
      const gems = Math.floor(Math.random() * 8) + 1;
      const mult = (1 + gems * 0.35).toFixed(2);
      return Math.random() > 0.4
        ? `открыл ${gems} 💎 · ${mult}×`
        : 'попал на мину 💥';
    },
    coin: () =>
      Math.random() > 0.5
        ? `выиграл +${bet}`
        : `проиграл −${bet}`,
  };

  return {
    id: `bot-${++botCounter}-${Date.now()}`,
    username,
    avatar: pick(AVATARS),
    game,
    action: actions[game](),
    bet,
    timestamp: Date.now(),
  };
}

export { GAME_LABELS, NAMES, AVATARS };
