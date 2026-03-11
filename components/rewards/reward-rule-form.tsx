"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  initialRewardActionState,
  type RewardActionState,
} from "@/lib/rewards/types";

interface RewardRuleFormProps {
  action: (
    previousState: RewardActionState,
    formData: FormData,
  ) => Promise<RewardActionState>;
}

export function RewardRuleForm({ action }: RewardRuleFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialRewardActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        Create reward rule
      </h2>

      {state.status === "error" && state.message ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.message}
        </div>
      ) : null}

      {state.status === "success" && state.message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.message}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={pending}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-100"
          placeholder="Free coffee"
        />
        {state.fieldErrors?.name ? (
          <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.name}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="points_required"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Points required
        </label>
        <input
          id="points_required"
          name="points_required"
          type="number"
          min={1}
          required
          disabled={pending}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-100"
          placeholder="50"
        />
        {state.fieldErrors?.points_required ? (
          <p className="mt-1 text-xs text-rose-600">
            {state.fieldErrors.points_required}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="reward_description"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Reward description
        </label>
        <textarea
          id="reward_description"
          name="reward_description"
          rows={3}
          required
          disabled={pending}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-100"
          placeholder="Describe what the customer receives"
        />
        {state.fieldErrors?.reward_description ? (
          <p className="mt-1 text-xs text-rose-600">
            {state.fieldErrors.reward_description}
          </p>
        ) : null}
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          defaultChecked
          disabled={pending}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:bg-slate-100"
        />
        Active
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {pending ? "Saving..." : "Save reward rule"}
      </button>
    </form>
  );
}
