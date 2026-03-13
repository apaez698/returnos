"use client";

import type { Ref } from "react";
import { touchInput } from "@/lib/ui/touch-targets";
import {
  isPotentialCurrencyInput,
  parseCurrencyInput,
} from "@/lib/pos/parse-currency-input";

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
  const parsed = parseCurrencyInput(value);
  const hasClientError = value.trim().length > 0 && !parsed.ok;
  const displayError =
    fieldError ??
    (hasClientError
      ? "Ingresa un monto valido. Ejemplos: 0.35, 1.20, 2.75"
      : undefined);

  return (
    <div>
      <label
        htmlFor="amount"
        className="mb-1.5 block text-sm font-medium text-slate-700"
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
          if (!parsed.ok) {
            return;
          }

          if (value !== parsed.value.normalized) {
            onChange(parsed.value.normalized);
          }
        }}
        placeholder="0.00"
        aria-invalid={displayError ? "true" : "false"}
        className={touchInput}
      />
      {displayError ? (
        <p className="mt-1 text-xs text-rose-600">{displayError}</p>
      ) : null}
    </div>
  );
}
