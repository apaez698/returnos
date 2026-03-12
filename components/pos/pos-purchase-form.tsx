"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  initialPosPurchaseActionState,
  PosCustomer,
  PosPurchaseActionState,
} from "@/lib/pos/types";
import { CustomerSearch } from "./customer-search";
import { PurchaseSuccessCard } from "./purchase-success-card";

interface PosPurchaseFormProps {
  initialCustomers: PosCustomer[];
  action: (
    previousState: PosPurchaseActionState,
    formData: FormData,
  ) => Promise<PosPurchaseActionState>;
}

export function PosPurchaseForm({
  initialCustomers,
  action,
}: PosPurchaseFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialPosPurchaseActionState,
  );
  const [query, setQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomer | null>(
    null,
  );
  const [amount, setAmount] = useState("");
  const selectedCustomerId = selectedCustomer?.id ?? "";

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return initialCustomers.slice(0, 8);
    }

    return initialCustomers
      .filter((customer) => {
        return (
          customer.name.toLowerCase().includes(normalizedQuery) ||
          customer.phone.toLowerCase().includes(normalizedQuery)
        );
      })
      .slice(0, 8);
  }, [initialCustomers, query]);

  useEffect(() => {
    if (state.status === "success") {
      setAmount("");
    }
  }, [state.status]);

  useEffect(() => {
    setSelectedCustomer((current) => {
      if (!current) {
        return current;
      }

      const stillVisible = results.some(
        (customer) => customer.id === current.id,
      );

      return stillVisible ? current : null;
    });
  }, [results]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Caja / POS</h2>
      <p className="mt-1 text-sm text-slate-600">
        Busca cliente, selecciona y registra la compra en segundos.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CustomerSearch
          query={query}
          customers={results}
          selectedCustomer={selectedCustomer}
          isLoading={false}
          hasSearched={query.trim().length > 0}
          onQueryChange={setQuery}
          onSelectCustomer={(customer) => {
            setSelectedCustomer(customer);
            setQuery(customer.name);
          }}
        />

        <form action={formAction} noValidate className="flex flex-col gap-4">
          <input type="hidden" name="customer_id" value={selectedCustomerId} />

          {/* Cliente seleccionado */}
          <div
            className={`rounded-md border px-3 py-2.5 ${
              selectedCustomer
                ? "border-indigo-200 bg-indigo-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Cliente seleccionado
            </p>
            {selectedCustomer ? (
              <div className="mt-1 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-indigo-900">
                    {selectedCustomer.name}
                  </p>
                  <p className="text-xs text-indigo-700">
                    {selectedCustomer.phone}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                  {selectedCustomer.points} pts
                </span>
              </div>
            ) : (
              <p className="mt-1 text-sm text-slate-500">
                Selecciona un cliente de la izquierda.
              </p>
            )}
          </div>

          {state.fieldErrors?.customer_id ? (
            <p className="-mt-2 text-xs text-rose-600">
              {state.fieldErrors.customer_id}
            </p>
          ) : null}

          {/* Monto */}
          <div>
            <label
              htmlFor="amount"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Monto
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              min={0.01}
              step="0.01"
              required
              disabled={!selectedCustomer}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            />
            {state.fieldErrors?.amount ? (
              <p className="mt-1 text-xs text-rose-600">
                {state.fieldErrors.amount}
              </p>
            ) : null}
          </div>

          {/* Montos rápidos */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500">
              Montos rápidos
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {(
                [
                  {
                    value: 1,
                    base: "border-sky-200 bg-sky-50 text-sky-800",
                    active: "border-sky-400 bg-sky-200 text-sky-900",
                  },
                  {
                    value: 2,
                    base: "border-violet-200 bg-violet-50 text-violet-800",
                    active: "border-violet-400 bg-violet-200 text-violet-900",
                  },
                  {
                    value: 3,
                    base: "border-indigo-200 bg-indigo-50 text-indigo-800",
                    active: "border-indigo-400 bg-indigo-200 text-indigo-900",
                  },
                  {
                    value: 5,
                    base: "border-amber-200 bg-amber-50 text-amber-800",
                    active: "border-amber-400 bg-amber-200 text-amber-900",
                  },
                  {
                    value: 10,
                    base: "border-emerald-200 bg-emerald-50 text-emerald-800",
                    active:
                      "border-emerald-400 bg-emerald-200 text-emerald-900",
                  },
                ] as const
              ).map(({ value, base, active }) => (
                <button
                  key={value}
                  type="button"
                  disabled={!selectedCustomer}
                  onClick={() => setAmount(String(value))}
                  className={`rounded-md border px-2 py-1.5 text-sm font-semibold transition ${
                    amount === String(value) && selectedCustomer ? active : base
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  ${value}
                </button>
              ))}
            </div>
          </div>

          {/* Botón registrar */}
          <button
            type="submit"
            disabled={!selectedCustomer || pending}
            className="w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Registrando..." : "Registrar compra"}
          </button>

          {state.status === "success" && state.receipt ? (
            <PurchaseSuccessCard receipt={state.receipt} />
          ) : null}

          {state.status === "error" && state.message ? (
            <p className="text-sm text-rose-700">{state.message}</p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
