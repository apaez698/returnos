"use client";

import { useActionState, useState } from "react";
import { acceptInvitationAction } from "@/features/team/actions/accept-invitation";
import type { AcceptInvitationActionState } from "@/features/team/actions/types";

interface AcceptInvitationFormProps {
  initialToken?: string;
}

export function AcceptInvitationForm({
  initialToken = "",
}: AcceptInvitationFormProps) {
  const initialState: AcceptInvitationActionState = { status: "idle" };

  const [state, formAction, pending] = useActionState<
    AcceptInvitationActionState,
    FormData
  >(acceptInvitationAction, initialState);

  const [token, setToken] = useState(initialToken);

  return (
    <form action={formAction} noValidate className="space-y-4">
      <div>
        <label
          htmlFor="token"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Token de invitacion
        </label>
        <input
          id="token"
          name="token"
          type="text"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          disabled={pending}
          placeholder="Pega aqui tu token"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
        />
        {state.fieldErrors?.token ? (
          <p className="mt-1 text-xs text-rose-600">
            {state.fieldErrors.token}
          </p>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {state.message}
        </div>
      ) : null}

      {state.status === "success" && state.message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Validando..." : "Aceptar invitacion"}
      </button>
    </form>
  );
}
