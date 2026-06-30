const BASE_RATE = 4;
const MILESTONES = [
  { refs: 3, bonus: 1 },
  { refs: 10, bonus: 1 },
  { refs: 25, bonus: 1 },
] as const;

export function getInvestmentRate(referrals: number): number {
  let rate = BASE_RATE;
  for (const { refs, bonus } of MILESTONES) {
    if (referrals >= refs) rate += bonus;
  }
  return rate;
}

export function getNextMilestone(referrals: number): {
  target: number;
  remaining: number;
  nextRate: number;
} | null {
  for (const { refs } of MILESTONES) {
    if (referrals < refs) {
      return {
        target: refs,
        remaining: refs - referrals,
        nextRate: getInvestmentRate(refs),
      };
    }
  }
  return null;
}

export function getReferralProgress(referrals: number) {
  return MILESTONES.map((m, i) => {
    const prevTarget = i === 0 ? 0 : MILESTONES[i - 1].refs;
    const progress = Math.min(
      100,
      Math.max(0, ((referrals - prevTarget) / (m.refs - prevTarget)) * 100),
    );
    return {
      ...m,
      unlocked: referrals >= m.refs,
      progress: referrals >= m.refs ? 100 : progress,
      label:
        i === 0
          ? `+${m.bonus}% за первые ${m.refs} реферала`
          : i === 1
            ? `+${m.bonus}% за ещё ${m.refs - MILESTONES[0].refs} рефералов`
            : `+${m.bonus}% за ещё ${m.refs - MILESTONES[1].refs} рефералов`,
    };
  });
}
