"use client";

import {
  REWARD_CUSTOMER_STATUS_FILTERS,
  type RewardCustomerStatusFilter,
} from "@/lib/rewards/reward-status";

interface RewardsStatusFiltersProps {
  value: RewardCustomerStatusFilter;
  onChange: (value: RewardCustomerStatusFilter) => void;
}

const STATUS_LABELS: Record<RewardCustomerStatusFilter, string> = {
  all: "Todos",
  eligible: "Canjeables",
  redeemed: "Canjearon",
  near_unlock: "Cerca de premio",
  active: "Activos",
};

export function RewardsStatusFilters({
  value,
  onChange,
}: RewardsStatusFiltersProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">Estado</p>
      <div className="flex flex-wrap gap-2">
        {REWARD_CUSTOMER_STATUS_FILTERS.map((status) => {
          const isActive = value === status;

          return (
            <button
              key={status}
              type="button"
              onClick={() => onChange(status)}
              aria-pressed={isActive}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
