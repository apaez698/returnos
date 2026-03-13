import type { RewardProgressStatus } from "@/lib/rewards/types";

interface LoyaltyRewardStatusProps {
  status: RewardProgressStatus;
  redeemableRewardName?: string | null;
  nextRewardName?: string | null;
  remainingPoints: number;
}

export function LoyaltyRewardStatus({
  status,
  redeemableRewardName,
  nextRewardName,
  remainingPoints,
}: LoyaltyRewardStatusProps) {
  if (status === "redeemable") {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
          Reward status
        </h2>
        <p className="mt-2 text-base font-semibold text-emerald-900">
          Reward unlocked
        </p>
        <p className="mt-1 text-sm text-emerald-800">
          {redeemableRewardName
            ? `You can redeem: ${redeemableRewardName}`
            : "You can redeem your reward on your next visit."}
        </p>
      </section>
    );
  }

  if (status === "in_progress") {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-800">
          Reward status
        </h2>
        <p className="mt-2 text-base font-semibold text-amber-900">
          Keep going
        </p>
        <p className="mt-1 text-sm text-amber-900/90">
          {nextRewardName
            ? `${remainingPoints} points left to unlock ${nextRewardName}.`
            : `${remainingPoints} points left to unlock your next reward.`}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
        Reward status
      </h2>
      <p className="mt-2 text-base font-semibold text-slate-900">
        No rewards available yet
      </p>
      <p className="mt-1 text-sm text-slate-600">
        New rewards will appear here as soon as this business adds them.
      </p>
    </section>
  );
}
