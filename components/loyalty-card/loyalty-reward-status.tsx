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
      <section className="h-full rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-emerald-100 p-3.5 shadow-sm shadow-emerald-100 sm:p-4 md:p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800 md:text-sm">
          Reward status
        </h2>
        <p className="mt-2.5 text-xl font-bold tracking-tight text-emerald-950 md:text-[1.65rem]">
          Reward unlocked
        </p>
        <p className="mt-2 text-sm text-emerald-900">
          {redeemableRewardName
            ? `You can redeem: ${redeemableRewardName}`
            : "You can redeem your reward on your next visit."}
        </p>
      </section>
    );
  }

  if (status === "in_progress") {
    return (
      <section className="h-full rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50 to-amber-100 p-3.5 shadow-sm shadow-amber-100 sm:p-4 md:p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800 md:text-sm">
          Reward status
        </h2>
        <p className="mt-2.5 text-xl font-bold tracking-tight text-amber-950 md:text-[1.65rem]">
          Keep going
        </p>
        <p className="mt-2 text-sm font-medium text-amber-950">
          {nextRewardName
            ? `${remainingPoints} points left to unlock ${nextRewardName}.`
            : `${remainingPoints} points left to unlock your next reward.`}
        </p>
      </section>
    );
  }

  return (
    <section className="h-full rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 p-3.5 shadow-sm shadow-slate-200/50 sm:p-4 md:p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 md:text-sm">
        Reward status
      </h2>
      <p className="mt-2.5 text-xl font-bold tracking-tight text-slate-900 md:text-[1.65rem]">
        No rewards available yet
      </p>
      <p className="mt-2 text-sm text-slate-700">
        New rewards will appear here as soon as this business adds them.
      </p>
    </section>
  );
}
