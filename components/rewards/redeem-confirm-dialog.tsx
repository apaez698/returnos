"use client";

import { getRewardRedemptionSummary } from "@/lib/rewards/redemption";

interface RedeemConfirmDialogProps {
  open: boolean;
  customerName: string;
  rewardName: string;
  currentPoints: number;
  pointsRequired: number;
  pending: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function RedeemConfirmDialog({
  open,
  customerName,
  rewardName,
  currentPoints,
  pointsRequired,
  pending,
  error,
  onClose,
  onConfirm,
}: RedeemConfirmDialogProps) {
  if (!open) {
    return null;
  }

  const summary = getRewardRedemptionSummary(currentPoints, pointsRequired);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm reward redemption"
    >
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-lg">
        <h3 className="text-base font-semibold text-slate-900">
          Redeem reward
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Confirm redemption for {customerName}.
        </p>

        <dl className="mt-4 space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-600">Reward</dt>
            <dd className="font-medium text-slate-900 text-right">
              {rewardName}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-600">Points required</dt>
            <dd className="font-medium text-slate-900">
              {summary.pointsRequired}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-600">Current points</dt>
            <dd className="font-medium text-slate-900">
              {summary.currentPoints}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-2">
            <dt className="text-slate-700">Points after redemption</dt>
            <dd className="font-semibold text-slate-900">
              {summary.pointsAfterRedemption}
            </dd>
          </div>
        </dl>

        {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending || !summary.canRedeem}
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Redeeming..." : "Confirm redemption"}
          </button>
        </div>
      </div>
    </div>
  );
}
