import type { RankFrame } from '../../types';

interface FrameConfig {
  label: string;
  className: string;
  badge: string;
}

export const FRAME_CONFIG: Record<RankFrame, FrameConfig> = {
  none: { label: '', className: 'frame-none', badge: '' },
  bronze: { label: 'Бронза', className: 'frame-bronze', badge: '🥉' },
  silver: { label: 'Серебро', className: 'frame-silver', badge: '🥈' },
  gold: { label: 'Золото', className: 'frame-gold', badge: '🥇' },
};

interface Props {
  avatar: string;
  frame: RankFrame;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

const SIZES = {
  sm: { outer: 48, inner: 40 },
  md: { outer: 72, inner: 60 },
  lg: { outer: 96, inner: 80 },
  xl: { outer: 120, inner: 100 },
};

export function AvatarFrame({
  avatar,
  frame,
  size = 'md',
  showBadge = false,
}: Props) {
  const cfg = FRAME_CONFIG[frame];
  const dim = SIZES[size];

  return (
    <div
      className={`avatar-frame ${cfg.className}`}
      style={{ width: dim.outer, height: dim.outer }}
    >
      <div
        className="avatar-frame__inner"
        style={{ width: dim.inner, height: dim.inner, fontSize: dim.inner * 0.45 }}
      >
        {avatar}
      </div>
      {showBadge && frame !== 'none' && (
        <span className="avatar-frame__badge">{cfg.badge}</span>
      )}
    </div>
  );
}
