"use client";

import { useMemo, useState } from "react";
import type { RedeemRewardResult } from "@/components/rewards/redeem-reward-button";
import type { RewardCustomerSearchItem } from "@/lib/rewards/reward-customer-types";
import {
  type RewardCustomerStatusFilter,
  matchesRewardStatusFilter,
} from "@/lib/rewards/reward-status";
import { RewardsCustomerResults } from "./rewards-customer-results";
import { RewardsSearchInput } from "./rewards-search-input";
import { RewardsStatusFilters } from "./rewards-status-filters";

interface SearchableRewardsPanelProps {
  initialItems: RewardCustomerSearchItem[];
  redeemAction?: (
    previousState: RedeemRewardResult,
    formData: FormData,
  ) => Promise<RedeemRewardResult>;
}

export function SearchableRewardsPanel({
  initialItems,
  redeemAction,
}: SearchableRewardsPanelProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<RewardCustomerStatusFilter>("all");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return initialItems
      .filter((item) => matchesRewardStatusFilter(item.reward_status, status))
      .filter((item) => {
        if (!normalizedQuery) {
          return true;
        }

        const name = item.customer_name.toLowerCase();
        const phone = item.customer_phone?.toLowerCase() ?? "";

        return (
          name.includes(normalizedQuery) || phone.includes(normalizedQuery)
        );
      });
  }, [initialItems, query, status]);

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <RewardsSearchInput value={query} onChange={setQuery} />
        <RewardsStatusFilters value={status} onChange={setStatus} />
      </div>

      <p className="text-xs text-slate-600">
        Mostrando {filteredItems.length} de {initialItems.length} clientes.
      </p>

      <RewardsCustomerResults
        items={filteredItems}
        redeemAction={redeemAction}
      />
    </section>
  );
}
