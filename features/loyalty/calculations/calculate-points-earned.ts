import { DEFAULT_POINTS_RULE, PointsRule } from "../types/points-rules";

export function calculatePointsEarned(
  amount: number,
  rule: PointsRule = DEFAULT_POINTS_RULE,
): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  const points = rule.calculate(amount);

  if (!Number.isFinite(points) || points <= 0) {
    return 0;
  }

  return Math.floor(points);
}
