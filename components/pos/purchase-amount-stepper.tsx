"use client";

const ADJUSTMENTS = [
  -1, -0.1, -0.05, -0.01, 0.01, 0.05, 0.1, 0.25, 0.5, 1,
] as const;

const NEGATIVE_ADJUSTMENTS = ADJUSTMENTS.filter((delta) => delta < 0);
const POSITIVE_ADJUSTMENTS = ADJUSTMENTS.filter((delta) => delta > 0);

interface PurchaseAmountStepperProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function parseAmountToCents(rawValue: string): number | null {
  const compact = rawValue.trim().replace(/\s+/g, "").replace(/^\$/, "");

  if (compact.length === 0) {
    return 0;
  }

  if (/[^\d.,]/.test(compact)) {
    return null;
  }

  const hasDot = compact.includes(".");
  const hasComma = compact.includes(",");

  if (
    (hasDot && hasComma) ||
    compact.split(".").length > 2 ||
    compact.split(",").length > 2
  ) {
    return null;
  }

  const separator = hasDot ? "." : hasComma ? "," : null;
  const [rawWholePart, rawFractionPart = ""] = separator
    ? compact.split(separator)
    : [compact, ""];

  if (!/^\d+$/.test(rawWholePart) || !/^\d*$/.test(rawFractionPart)) {
    return null;
  }

  if (rawFractionPart.length > 2) {
    return null;
  }

  const wholePart = rawWholePart.replace(/^0+(?=\d)/, "") || "0";
  const fractionPart = rawFractionPart.padEnd(2, "0");

  const whole = Number(wholePart);
  const fraction = Number(fractionPart);

  if (!Number.isSafeInteger(whole) || !Number.isSafeInteger(fraction)) {
    return null;
  }

  const cents = whole * 100 + fraction;
  return Number.isSafeInteger(cents) ? cents : null;
}

function formatCents(cents: number): string {
  const clamped = Math.max(0, cents);
  const whole = Math.floor(clamped / 100);
  const fraction = String(clamped % 100).padStart(2, "0");
  return `${whole}.${fraction}`;
}

function formatAdjustment(delta: number): string {
  const sign = delta >= 0 ? "+" : "-";
  return `${sign}${Math.abs(delta).toFixed(2)}`;
}

export function PurchaseAmountStepper({
  value,
  onChange,
  disabled = false,
}: PurchaseAmountStepperProps) {
  const handleAdjustment = (delta: number) => {
    const currentCents = parseAmountToCents(value) ?? 0;
    const deltaCents = Math.round(delta * 100);
    const nextCents = Math.max(0, currentCents + deltaCents);
    onChange(formatCents(nextCents));
  };

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        Ajustes rapidos
      </p>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
        <section className="rounded-xl border border-rose-100 bg-rose-50/40 p-2">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
            Reducir
          </p>
          <div className="grid grid-cols-2 gap-2">
            {NEGATIVE_ADJUSTMENTS.map((delta) => (
              <button
                key={delta}
                type="button"
                disabled={disabled}
                onClick={() => handleAdjustment(delta)}
                className={[
                  "flex min-h-[52px] items-center justify-center rounded-xl border px-3 text-base font-semibold",
                  "transition active:scale-[0.98]",
                  "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100",
                  "disabled:cursor-not-allowed disabled:opacity-45",
                ].join(" ")}
                aria-label={`Reducir monto en ${Math.abs(delta).toFixed(2)}`}
              >
                {formatAdjustment(delta)}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-2">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            Aumentar
          </p>
          <div className="grid grid-cols-2 gap-2">
            {POSITIVE_ADJUSTMENTS.map((delta) => (
              <button
                key={delta}
                type="button"
                disabled={disabled}
                onClick={() => handleAdjustment(delta)}
                className={[
                  "flex min-h-[52px] items-center justify-center rounded-xl border px-3 text-base font-semibold",
                  "transition active:scale-[0.98]",
                  "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
                  "disabled:cursor-not-allowed disabled:opacity-45",
                ].join(" ")}
                aria-label={`Aumentar monto en ${Math.abs(delta).toFixed(2)}`}
              >
                {formatAdjustment(delta)}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
