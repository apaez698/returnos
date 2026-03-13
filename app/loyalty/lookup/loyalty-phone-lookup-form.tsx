"use client";

import { useActionState, useState } from "react";
import { lookupLoyaltyCardByPhoneAction } from "./actions";
import { initialLoyaltyLookupState } from "./state";
import { LoyaltyPhoneLookupEmptyState } from "./loyalty-phone-lookup-empty-state";

interface LoyaltyPhoneLookupFormProps {
  businessId?: string;
  businessSlug?: string;
}

export function LoyaltyPhoneLookupForm({
  businessId = "",
  businessSlug = "",
}: LoyaltyPhoneLookupFormProps) {
  const [state, formAction, pending] = useActionState(
    lookupLoyaltyCardByPhoneAction,
    initialLoyaltyLookupState,
  );
  const [phone, setPhone] = useState("");

  return (
    <form action={formAction} noValidate className="space-y-4">
      <input type="hidden" name="business_id" value={businessId} />
      <input type="hidden" name="business_slug" value={businessSlug} />

      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-base font-medium text-zinc-800"
        >
          Numero de telefono
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Ejemplo: 5512345678"
          className="w-full rounded-xl border border-zinc-300 px-4 py-4 text-lg text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          aria-describedby="phone-help"
        />
        <p id="phone-help" className="mt-2 text-sm text-zinc-600">
          Usa el mismo numero con el que te registraste.
        </p>
      </div>

      {state.status === "not_found" ? (
        <LoyaltyPhoneLookupEmptyState message={state.message} />
      ) : null}

      {state.status === "error" && state.message ? (
        <p
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-orange-600 px-4 py-4 text-base font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
      >
        {pending ? "Buscando tarjeta..." : "Buscar tarjeta"}
      </button>
    </form>
  );
}
