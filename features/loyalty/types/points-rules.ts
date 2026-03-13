export interface PointsRule {
  id: string;
  description: string;
  calculate(amount: number): number;
}

export interface AmountPerPointRuleConfig {
  id: string;
  description: string;
  amountPerPoint: number;
}

export function createAmountPerPointRule(
  config: AmountPerPointRuleConfig,
): PointsRule {
  return {
    id: config.id,
    description: config.description,
    calculate(amount: number) {
      if (!Number.isFinite(amount) || amount <= 0) {
        return 0;
      }

      const rawPoints = amount / config.amountPerPoint;
      const normalizedPoints = Math.round(rawPoints * 1_000_000) / 1_000_000;

      return Math.floor(normalizedPoints);
    },
  };
}

export const DEFAULT_POINTS_RULE = createAmountPerPointRule({
  id: "points-per-10-cents-v1",
  description: "1 point per $0.10 spent",
  amountPerPoint: 0.1,
});
