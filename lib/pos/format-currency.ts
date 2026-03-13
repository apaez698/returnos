interface FormatCurrencyOptions {
  locale?: string;
  currency?: string;
}

export function formatCurrency(
  value: number,
  options: FormatCurrencyOptions = {},
): string {
  const { locale = "es-MX", currency = "MXN" } = options;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
