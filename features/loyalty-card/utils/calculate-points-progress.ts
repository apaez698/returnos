function normalizePoints(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

export function calculatePointsProgress(
  currentPoints: number,
  targetPoints: number | null | undefined,
): number {
  if (
    typeof targetPoints !== "number" ||
    !Number.isFinite(targetPoints) ||
    targetPoints <= 0
  ) {
    return 0;
  }

  const normalizedCurrentPoints = normalizePoints(currentPoints);
  const rawPercentage = (normalizedCurrentPoints / targetPoints) * 100;

  if (!Number.isFinite(rawPercentage)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(rawPercentage)));
}
