"use client";

import {
  useActionState,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
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
  const [clientError, setClientError] = useState<string | null>(null);
  const [lastSubmittedPhone, setLastSubmittedPhone] = useState<string | null>(
    null,
  );

  const normalizedPhoneDigits = phone.replace(/\D/g, "");
  const showServerFeedback =
    lastSubmittedPhone !== null && phone.trim() === lastSubmittedPhone;
  const fieldError =
    clientError ??
    (showServerFeedback && state.status === "error" ? state.message : null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const trimmedPhone = phone.trim();

    if (trimmedPhone.length === 0) {
      event.preventDefault();
      setClientError("Escribe tu numero de telefono para continuar.");
      setLastSubmittedPhone(null);
      return;
    }

    if (normalizedPhoneDigits.length < 10) {
      event.preventDefault();
      setClientError("Ingresa al menos 10 digitos para buscar tu tarjeta.");
      setLastSubmittedPhone(null);
      return;
    }

    setClientError(null);
    setLastSubmittedPhone(trimmedPhone);
  }

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    setPhone(event.target.value);

    if (clientError) {
      setClientError(null);
    }
  }

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-5 md:space-y-6"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="business_id" value={businessId} />
      <input type="hidden" name="business_slug" value={businessSlug} />

      <div className="md:flex md:items-end md:gap-4">
        <div className="md:flex-1">
          <label
            htmlFor="phone"
            className="mb-2 block text-base font-semibold text-zinc-900 md:text-lg"
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
            enterKeyHint="search"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="Ejemplo: 5512345678"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-4 text-lg text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200 md:text-xl"
            aria-describedby={
              fieldError ? "phone-help phone-error" : "phone-help"
            }
            aria-invalid={fieldError ? true : undefined}
          />
          <p
            id="phone-help"
            className="mt-2 text-sm text-zinc-600 md:text-base"
          >
            Usa el mismo numero con el que te registraste. Solo necesitamos los
            digitos.
          </p>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-xl bg-orange-600 px-5 py-4 text-base font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300 md:mt-0 md:min-w-56 md:text-lg"
        >
          {pending ? "Buscando tarjeta..." : "Buscar tarjeta"}
        </button>
      </div>

      {fieldError ? (
        <p
          id="phone-error"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 md:text-base"
          role="alert"
        >
          {fieldError}
        </p>
      ) : null}

      {showServerFeedback && state.status === "not_found" ? (
        <LoyaltyPhoneLookupEmptyState message={state.message} />
      ) : null}
    </form>
  );
}
