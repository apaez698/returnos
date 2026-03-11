"use client";

import { useActionState, useEffect, useState } from "react";
import { CustomerListItem } from "@/lib/customers/types";
import {
  initialVisitActionState,
  VisitActionState,
  visitSources,
} from "@/lib/visits/types";

interface VisitFormProps {
  customers: CustomerListItem[];
  action: (
    previousState: VisitActionState,
    formData: FormData,
  ) => Promise<VisitActionState>;
}

const sourceLabels: Record<(typeof visitSources)[number], string> = {
  manual: "Manual",
  in_store: "En tienda",
  qr: "QR",
};

export function VisitForm({ customers, action }: VisitFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialVisitActionState,
  );
  const [formValues, setFormValues] = useState({
    customer_id: "",
    points_earned: "0",
    amount: "",
    product_category: "",
    source: "manual",
  });

  useEffect(() => {
    if (state.status === "success") {
      setFormValues((current) => ({
        ...current,
        points_earned: "0",
        amount: "",
        product_category: "",
        source: "manual",
      }));
    } else if (state.status === "error" && state.fieldErrors) {
      // Reset only the fields that have validation errors
      setFormValues((current) => ({
        ...current,
        ...(state.fieldErrors?.customer_id && { customer_id: "" }),
        ...(state.fieldErrors?.points_earned && { points_earned: "0" }),
        ...(state.fieldErrors?.amount && { amount: "" }),
        ...(state.fieldErrors?.product_category && { product_category: "" }),
        ...(state.fieldErrors?.source && { source: "manual" }),
      }));
    }
  }, [state.status, state.fieldErrors]);

  return (
    <form
      action={formAction}
      noValidate
      className="rounded-lg border border-slate-200 bg-white p-6"
    >
      <h2 className="text-lg font-semibold text-slate-900">Registrar visita</h2>
      <p className="mt-1 text-sm text-slate-600">
        Selecciona el cliente y registra puntos en menos de 10 segundos.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label
            htmlFor="customer_id"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Cliente
          </label>
          <select
            id="customer_id"
            name="customer_id"
            required
            value={formValues.customer_id}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                customer_id: event.target.value,
              }))
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 focus:ring-2"
          >
            <option value="">Selecciona un cliente</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.phone}
              </option>
            ))}
          </select>
          {state.fieldErrors?.customer_id ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.customer_id}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="points_earned"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Puntos ganados
          </label>
          <input
            id="points_earned"
            name="points_earned"
            type="number"
            min={0}
            step={1}
            required
            value={formValues.points_earned}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                points_earned: event.target.value,
              }))
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 focus:ring-2"
          />
          {state.fieldErrors?.points_earned ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.points_earned}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="source"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Origen
          </label>
          <select
            id="source"
            name="source"
            required
            value={formValues.source}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                source: event.target.value,
              }))
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 focus:ring-2"
          >
            {visitSources.map((source) => (
              <option key={source} value={source}>
                {sourceLabels[source]}
              </option>
            ))}
          </select>
          {state.fieldErrors?.source ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.source}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="amount"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Monto (opcional)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min={0}
            step="0.01"
            value={formValues.amount}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                amount: event.target.value,
              }))
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 focus:ring-2"
          />
          {state.fieldErrors?.amount ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.amount}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="product_category"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Categoria de producto (opcional)
          </label>
          <input
            id="product_category"
            name="product_category"
            type="text"
            placeholder="Pan dulce, cafe, almuerzo..."
            value={formValues.product_category}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                product_category: event.target.value,
              }))
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-indigo-500 focus:ring-2"
          />
          {state.fieldErrors?.product_category ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.product_category}
            </p>
          ) : null}
        </div>
      </div>

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
        disabled={pending || customers.length === 0}
        className="mt-5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar visita"}
      </button>
    </form>
  );
}
