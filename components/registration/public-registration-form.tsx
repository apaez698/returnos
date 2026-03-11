"use client";

import { useActionState, useEffect, useState } from "react";
import {
  PublicRegistrationResult,
  initialPublicRegistrationResult,
} from "@/app/r/[slug]/types";

interface PublicRegistrationFormProps {
  businessName: string;
  action: (
    previousState: PublicRegistrationResult,
    formData: FormData,
  ) => Promise<PublicRegistrationResult>;
}

export function PublicRegistrationForm({
  businessName,
  action,
}: PublicRegistrationFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialPublicRegistrationResult,
  );
  const [formValues, setFormValues] = useState({
    name: "",
    phone: "",
    email: "",
    birthday: "",
    consent_marketing: false,
  });

  useEffect(() => {
    if (state.success) {
      setFormValues({
        name: "",
        phone: "",
        email: "",
        birthday: "",
        consent_marketing: false,
      });
    }
  }, [state.success]);

  if (state.success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="text-3xl">🎉</div>
        <h2 className="mt-3 text-lg font-semibold text-emerald-800">
          ¡Te registraste con éxito!
        </h2>
        <p className="mt-1 text-sm text-emerald-700">
          Ya eres parte del programa de lealtad de{" "}
          <span className="font-medium">{businessName}</span>. ¡Gracias por
          unirte!
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Nombre completo <span className="text-rose-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={formValues.name}
          onChange={(e) =>
            setFormValues((v) => ({ ...v, name: e.target.value }))
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Teléfono <span className="text-rose-500">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          value={formValues.phone}
          onChange={(e) =>
            setFormValues((v) => ({ ...v, phone: e.target.value }))
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          placeholder="+521234567890"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Correo electrónico{" "}
          <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={formValues.email}
          onChange={(e) =>
            setFormValues((v) => ({ ...v, email: e.target.value }))
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          placeholder="correo@ejemplo.com"
        />
      </div>

      <div>
        <label
          htmlFor="birthday"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Fecha de cumpleaños{" "}
          <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <input
          id="birthday"
          name="birthday"
          type="date"
          value={formValues.birthday}
          onChange={(e) =>
            setFormValues((v) => ({ ...v, birthday: e.target.value }))
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-700">
        <input
          id="consent_marketing"
          name="consent_marketing"
          type="checkbox"
          checked={formValues.consent_marketing}
          onChange={(e) =>
            setFormValues((v) => ({
              ...v,
              consent_marketing: e.target.checked,
            }))
          }
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600"
        />
        <span>
          Acepto recibir promociones y comunicaciones de{" "}
          <span className="font-medium">{businessName}</span>.
        </span>
      </label>

      {state.error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Registrando..." : "Unirme al programa"}
      </button>
    </form>
  );
}
