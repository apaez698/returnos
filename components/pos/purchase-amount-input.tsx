"use client";

import type { Ref } from "react";
import { touchInput } from "@/lib/ui/touch-targets";
import {
  isPotentialCurrencyInput,
  parseCurrencyInput,
} from "@/lib/pos/parse-currency-input";
import { PurchaseAmountStepper } from "./purchase-amount-stepper";

interface PurchaseAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  fieldError?: string;
  inputRef?: Ref<HTMLInputElement>;
}

export function PurchaseAmountInput({
  value,
  onChange,
  disabled = false,
  fieldError,
  inputRef,
}: PurchaseAmountInputProps) {
  const compact = value.trim().replace(/\s+/g, "").replace(/^\$/, "");
  const zeroOrPositiveWithTwoDecimals = /^\d+([.,]\d{1,2})?$/.test(compact)
    ? (() => {
        const [wholeRaw, fractionRaw = ""] = compact
          .replace(",", ".")
          .split(".");
        const whole = (wholeRaw.replace(/^0+(?=\d)/, "") || "0").trim();
        const fraction = fractionRaw.padEnd(2, "0");
        return `${whole}.${fraction}`;
      })()
    : null;
  const parsed = parseCurrencyInput(value);
  const hasClientError = value.trim().length > 0 && !parsed.ok;
  const displayError =
    fieldError ??
    (hasClientError
      ? "Ingresa un monto valido. Ejemplos: 0.35, 1.20, 2.75"
      : undefined);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-3.5">
      <label
        htmlFor="amount"
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        Monto
      </label>

      <input
        ref={inputRef}
        id="amount"
        name="amount"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        required
        disabled={disabled}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;

          if (!isPotentialCurrencyInput(nextValue)) {
            return;
          }

          onChange(nextValue);
        }}
        onBlur={() => {
          if (parsed.ok) {
            if (value !== parsed.value.normalized) {
              onChange(parsed.value.normalized);
            }
            return;
          }

          if (
            zeroOrPositiveWithTwoDecimals &&
            value !== zeroOrPositiveWithTwoDecimals
          ) {
            onChange(zeroOrPositiveWithTwoDecimals);
          }
        }}
        placeholder="0.00"
        aria-invalid={displayError ? "true" : "false"}
        className={`${touchInput} min-h-[92px] text-center text-4xl font-black leading-none tracking-tight sm:text-5xl`}
      />

      <div className="mt-3">
        <PurchaseAmountStepper
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      </div>

      {displayError ? (
        <p className="mt-1 text-xs text-rose-600">{displayError}</p>
      ) : null}
    </div>
  );
}
