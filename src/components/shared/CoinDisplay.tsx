interface Props {
  value: number;
  className?: string;
}

export function CoinDisplay({ value, className = '' }: Props) {
  return (
    <span className={`coin-display ${className}`}>
      <span className="coin-display__icon">🪙</span>
      <span className="coin-display__value">{value.toLocaleString('ru-RU')}</span>
    </span>
  );
}
