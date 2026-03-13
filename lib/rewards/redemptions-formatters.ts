export type RedemptionValueMode = "points" | "cashback";

interface FormatRedemptionValueOptions {
  mode?: RedemptionValueMode;
  currency?: string;
  locale?: string;
}

export function formatRedemptionDate(
  dateInput: string | null | undefined,
  locale = "es-MX",
): string {
  if (!dateInput) {
    return "-";
  }

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRedemptionValue(
  value: number | null | undefined,
  options: FormatRedemptionValueOptions = {},
): string {
  const { mode = "points", currency = "MXN", locale = "es-MX" } = options;
  const safeValue =
    typeof value === "number" && Number.isFinite(value) ? value : 0;

  if (mode === "cashback") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeValue);
  }

  return `${safeValue} pts`;
}
