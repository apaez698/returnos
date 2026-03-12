"use client";

import { useActionState, useState } from "react";
import { type CreateBusinessOwnerInput } from "@/lib/onboarding/onboarding-schema";
import {
  initialOnboardingActionState,
  type OnboardingActionState,
} from "@/lib/onboarding/types";
import { BusinessTypeSelect } from "./business-type-select";

interface BusinessOnboardingFormProps {
  action: (
    previousState: OnboardingActionState,
    formData: FormData,
  ) => Promise<OnboardingActionState>;
}

export function BusinessOnboardingForm({
  action,
}: BusinessOnboardingFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialOnboardingActionState,
  );
  const [formValues, setFormValues] = useState<CreateBusinessOwnerInput>({
    businessName: "",
    businessType: "bakery",
  });

  return (
    <form action={formAction} noValidate className="space-y-4">
      <div>
        <label
          htmlFor="businessName"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Nombre de tu negocio
        </label>
        <input
          id="businessName"
          name="businessName"
          type="text"
          required
          disabled={pending}
          autoComplete="organization"
          value={formValues.businessName}
          onChange={(event) =>
            setFormValues((current) => ({
              ...current,
              businessName: event.target.value,
            }))
          }
          placeholder="Panaderia La Delicia"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
        />
        {state.fieldErrors?.businessName ? (
          <p className="mt-1 text-xs text-rose-600">
            {state.fieldErrors.businessName}
          </p>
        ) : null}
      </div>

      <BusinessTypeSelect
        value={formValues.businessType}
        onChange={(businessType) =>
          setFormValues((current) => ({
            ...current,
            businessType,
          }))
        }
        disabled={pending}
        error={state.fieldErrors?.businessType}
      />

      {state.status === "error" && state.message ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Creando negocio..." : "Crear negocio y continuar"}
      </button>

      <p className="text-xs text-slate-500">
        Al continuar, crearemos tu negocio y te asignaremos como owner.
      </p>
    </form>
  );
}
