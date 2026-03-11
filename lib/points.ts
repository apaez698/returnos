export function rewardProgress(visits: number, targetVisits: number): number {
  if (targetVisits <= 0) {
    return 0;
  }

  const rawProgress = (visits / targetVisits) * 100;
  return Math.min(100, Math.max(0, Math.round(rawProgress)));
}
