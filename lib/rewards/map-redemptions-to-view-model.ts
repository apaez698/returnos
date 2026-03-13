import { RedemptionItem } from "@/lib/rewards/redemptions-types";

type Relation<T> = T | T[] | null | undefined;

interface RawCustomerRelation {
  name?: string | null;
  phone?: string | null;
}

interface RawRewardRuleRelation {
  id?: string | null;
  name?: string | null;
  reward_description?: string | null;
}

export interface RawRedemptionRow {
  id?: string | null;
  customer_id?: string | null;
  reward_rule_id?: string | null;
  points_spent?: number | null;
  redeemed_at?: string | null;
  created_at?: string | null;
  customers?: Relation<RawCustomerRelation>;
  reward_rules?: Relation<RawRewardRuleRelation>;
}

function getRelationValue<T>(relation: Relation<T>): T | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function toSafeNumber(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return value;
}

export function mapRedemptionToViewModel(
  row: RawRedemptionRow,
): RedemptionItem {
  const customer = getRelationValue(row.customers);
  const rewardRule = getRelationValue(row.reward_rules);

  return {
    id: row.id ?? "",
    customer_id: row.customer_id ?? "",
    customer_name: customer?.name ?? "Desconocido",
    customer_phone: customer?.phone ?? null,
    reward_id: row.reward_rule_id ?? rewardRule?.id ?? "",
    reward_name: rewardRule?.name ?? "Recompensa no disponible",
    reward_description: rewardRule?.reward_description ?? "",
    points_spent: toSafeNumber(row.points_spent),
    redeemed_at: row.redeemed_at ?? "",
    created_at: row.created_at ?? "",
  };
}

export function mapRedemptionsToViewModel(
  rows: RawRedemptionRow[] | null | undefined,
): RedemptionItem[] {
  if (!rows || rows.length === 0) {
    return [];
  }

  return rows.map(mapRedemptionToViewModel);
}
