export function formatCoins(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
}

export function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}×`;
}

export function formatTimeLeft(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

export function generateReferralLink(username: string): string {
  const code = btoa(username).replace(/=/g, '').slice(0, 8).toLowerCase();
  return `https://neon-hub.app/invite/${code}`;
}
