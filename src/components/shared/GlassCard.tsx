interface Props {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'purple' | 'gold' | 'none';
}

export function GlassCard({ children, className = '', glow = 'none' }: Props) {
  return (
    <div className={`glass-card glass-card--${glow} ${className}`}>
      {children}
    </div>
  );
}
