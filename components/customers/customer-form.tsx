"use client";

import { useActionState, useEffect, useState } from "react";
import {
  CustomerActionState,
  initialCustomerActionState,
} from "@/lib/customers/types";

interface CustomerFormProps {
  action: (
    previousState: CustomerActionState,
    formData: FormData,
  ) => Promise<CustomerActionState>;
}

export function CustomerForm({ action }: CustomerFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialCustomerActionState,
  );
  const [formValues, setFormValues] = useState({
    name: "",
    phone: "",
    email: "",
    birthday: "",
    consent_marketing: false,
  });

  useEffect(() => {
    if (state.status === "success") {
      setFormValues({
        name: "",
        phone: "",
        email: "",
        birthday: "",
        consent_marketing: false,
      });
    }
  }, [state.status]);

  return (
    <form
      action={formAction}
      noValidate
      className="rounded-lg border border-slate-200 bg-white p-6"
    >
      <h2 className="text-lg font-semibold text-slate-900">Agregar cliente</h2>
      <p className="mt-1 text-sm text-slate-600">
        Registra un cliente manualmente para sumar visitas y recompensas.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formValues.name}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-indigo-500 focus:ring-2"
          />
          {state.fieldErrors?.name ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Telefono
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="+521234567890"
            value={formValues.phone}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                phone: event.target.value,
              }))
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-indigo-500 focus:ring-2"
          />
          {state.fieldErrors?.phone ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.phone}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Correo (opcional)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-indigo-500 focus:ring-2"
          />
          {state.fieldErrors?.email ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="birthday"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Cumpleanos (opcional)
          </label>
          <input
            id="birthday"
            name="birthday"
            type="date"
            value={formValues.birthday}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                birthday: event.target.value,
              }))
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-indigo-500 focus:ring-2"
          />
          {state.fieldErrors?.birthday ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.birthday}
            </p>
          ) : null}
        </div>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
        <input
          id="consent_marketing"
          name="consent_marketing"
          type="checkbox"
          checked={formValues.consent_marketing}
          onChange={(event) =>
            setFormValues((current) => ({
              ...current,
              consent_marketing: event.target.checked,
            }))
          }
          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
        />
        Acepta comunicaciones de marketing
      </label>

      {state.message ? (
        <p
          className={`mt-4 text-sm ${
            state.status === "success" ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar cliente"}
      </button>
    </form>
  );
}
