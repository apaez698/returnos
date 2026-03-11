"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { RedeemConfirmDialog } from "@/components/rewards/redeem-confirm-dialog";

export type RedeemRewardResult = {
  success: boolean;
  error: string | null;
  message: string | null;
};

const initialRedeemRewardResult: RedeemRewardResult = {
  success: false,
  error: null,
  message: null,
};

interface RedeemRewardButtonProps {
  customerId: string;
  customerName: string;
  currentPoints: number;
  rewardRuleId: string;
  rewardName: string;
  pointsRequired: number;
  action: (
    previousState: RedeemRewardResult,
    formData: FormData,
  ) => Promise<RedeemRewardResult>;
}

export function RedeemRewardButton({
  customerId,
  customerName,
  currentPoints,
  rewardRuleId,
  rewardName,
  pointsRequired,
  action,
}: RedeemRewardButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    action,
    initialRedeemRewardResult,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        Redeem reward
      </button>

      {state.message ? (
        <p
          className={`mt-2 text-xs ${
            state.success ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <form ref={formRef} action={formAction} className="hidden">
        <input type="hidden" name="customer_id" value={customerId} />
        <input type="hidden" name="reward_rule_id" value={rewardRuleId} />
      </form>

      <RedeemConfirmDialog
        open={open}
        customerName={customerName}
        rewardName={rewardName}
        currentPoints={currentPoints}
        pointsRequired={pointsRequired}
        pending={pending}
        error={state.error}
        onClose={() => setOpen(false)}
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </div>
  );
}
