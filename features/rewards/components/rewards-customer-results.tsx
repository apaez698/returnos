import type { RewardCustomerSearchItem } from "@/lib/rewards/reward-customer-types";
import type { RedeemRewardResult } from "@/components/rewards/redeem-reward-button";
import { RewardsCustomerCard } from "./rewards-customer-card";
import { RewardsEmptyState } from "./rewards-empty-state";

interface RewardsCustomerResultsProps {
  items: RewardCustomerSearchItem[];
  isLoading?: boolean;
  redeemAction?: (
    previousState: RedeemRewardResult,
    formData: FormData,
  ) => Promise<RedeemRewardResult>;
}

export function RewardsCustomerResults({
  items,
  isLoading = false,
  redeemAction,
}: RewardsCustomerResultsProps) {
  if (isLoading && items.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        Buscando clientes...
      </div>
    );
  }

  if (items.length === 0) {
    return <RewardsEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <RewardsCustomerCard
          key={item.customer_id}
          customer={item}
          redeemAction={redeemAction}
        />
      ))}
    </div>
  );
}
