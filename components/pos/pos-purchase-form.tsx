"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  initialPosPurchaseActionState,
  PosCustomer,
  PosCreateCustomerActionState,
  PosPurchaseActionState,
  PosRewardThreshold,
} from "@/lib/pos/types";
import { twoColTabletGrid } from "@/lib/ui/responsive";
import { touchPrimary, touchQuickAmount } from "@/lib/ui/touch-targets";
import { parseCurrencyInput } from "@/lib/pos/parse-currency-input";
import { CustomerSearch } from "./customer-search";
import { PosCreateCustomerModal } from "./pos-create-customer-modal";
import { PurchaseAmountInput } from "./purchase-amount-input";
import { PurchaseConfirmationModal } from "./purchase-confirmation-modal";
import { usePosCustomerFlow } from "./use-pos-customer-flow";

interface PosPurchaseFormProps {
  initialCustomers: PosCustomer[];
  rewardThresholds?: PosRewardThreshold[];
  action: (
    previousState: PosPurchaseActionState,
    formData: FormData,
  ) => Promise<PosPurchaseActionState>;
  createCustomerAction?: (
    previousState: PosCreateCustomerActionState,
    formData: FormData,
  ) => Promise<PosCreateCustomerActionState>;
}

export function PosPurchaseForm({
  initialCustomers,
  rewardThresholds = [],
  action,
  createCustomerAction,
}: PosPurchaseFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialPosPurchaseActionState,
  );
  const [amount, setAmount] = useState("");
  const [isSummaryDismissed, setIsSummaryDismissed] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const {
    query,
    setQuery,
    results,
    hasSearched,
    selectedCustomer,
    selectedCustomerId,
    selectCustomer,
    isCreateCustomerModalOpen,
    createCustomerModalKey,
    openCreateCustomerModal,
    closeCreateCustomerModal,
    handleCustomerCreated,
    createCustomerDefaults,
  } = usePosCustomerFlow({ initialCustomers });
  const parsedAmount = parseCurrencyInput(amount);
  const isAmountValid = parsedAmount.ok;

  useEffect(() => {
    if (state.status === "success") {
      setAmount("");
      setIsSummaryDismissed(false);
    }
  }, [state]);

  function prepareNextPurchase() {
    setAmount("");
    setIsSummaryDismissed(true);
    amountInputRef.current?.focus();
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <p className="mt-1 text-sm text-slate-600">
        Busca cliente, selecciona y registra la compra en segundos.
      </p>

      <div className={`mt-5 ${twoColTabletGrid}`}>
        <CustomerSearch
          query={query}
          customers={results}
          selectedCustomer={selectedCustomer}
          isLoading={false}
          hasSearched={hasSearched}
          onQueryChange={setQuery}
          onSelectCustomer={selectCustomer}
          onCreateCustomer={
            createCustomerAction ? openCreateCustomerModal : undefined
          }
        />

        <form action={formAction} noValidate className="flex flex-col gap-4">
          <input type="hidden" name="customer_id" value={selectedCustomerId} />

          {/* Cliente seleccionado */}
          <div
            className={`rounded-xl border px-4 py-3.5 ${
              selectedCustomer
                ? "border-indigo-200 bg-indigo-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Cliente seleccionado
            </p>
            {selectedCustomer ? (
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-indigo-900">
                    {selectedCustomer.name}
                  </p>
                  <p className="text-sm text-indigo-700">
                    {selectedCustomer.phone}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-bold text-indigo-700">
                  {selectedCustomer.points} pts
                </span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
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
          <PurchaseAmountInput
            inputRef={amountInputRef}
            value={amount}
            onChange={setAmount}
            disabled={!selectedCustomer}
            fieldError={state.fieldErrors?.amount}
          />

          {/* Montos rápidos */}
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">
              Montos rápidos
            </p>
            <div className="grid grid-cols-5 gap-2">
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
                  onClick={() => setAmount(`${value}.00`)}
                  className={`${touchQuickAmount} ${
                    amount === `${value}.00` && selectedCustomer ? active : base
                  }`}
                >
                  ${value}
                </button>
              ))}
            </div>
          </div>

          {/* Botón registrar */}
          <button
            type="submit"
            disabled={!selectedCustomer || pending || !isAmountValid}
            className={touchPrimary}
          >
            {pending ? "Registrando..." : "Registrar compra"}
          </button>

          {state.status === "success" &&
          state.receipt &&
          !isSummaryDismissed ? (
            <PurchaseConfirmationModal
              receipt={state.receipt}
              rewardThresholds={rewardThresholds}
              onClose={prepareNextPurchase}
            />
          ) : null}

          {state.status === "error" && state.message ? (
            <p className="text-sm text-rose-700">{state.message}</p>
          ) : null}
        </form>
      </div>

      {isCreateCustomerModalOpen && createCustomerAction ? (
        <PosCreateCustomerModal
          key={createCustomerModalKey}
          initialName={createCustomerDefaults.name}
          initialPhone={createCustomerDefaults.phone}
          action={createCustomerAction}
          onClose={closeCreateCustomerModal}
          onCreated={handleCustomerCreated}
        />
      ) : null}
    </section>
  );
}
