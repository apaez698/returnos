const TWO_DECIMALS = 2;

export interface ParsedCurrencyInput {
  amount: number;
  cents: number;
  normalized: string;
}

export type ParsedCurrencyInputResult =
  | { ok: true; value: ParsedCurrencyInput }
  | { ok: false; reason: string };

function normalizeWholePart(rawWhole: string): string {
  const trimmedLeadingZeros = rawWhole.replace(/^0+(?=\d)/, "");
  return trimmedLeadingZeros.length > 0 ? trimmedLeadingZeros : "0";
}

function buildNormalizedAmount(
  wholePart: string,
  fractionPart: string,
): string {
  return `${wholePart}.${fractionPart}`;
}

export function parseCurrencyInput(
  rawInput: string,
): ParsedCurrencyInputResult {
  const compact = rawInput.trim().replace(/\s+/g, "").replace(/^\$/, "");

  if (compact.length === 0) {
    return { ok: false, reason: "empty" };
  }

  if (/[^\d.,]/.test(compact)) {
    return { ok: false, reason: "invalid_characters" };
  }

  const hasDot = compact.includes(".");
  const hasComma = compact.includes(",");

  if (
    (hasDot && hasComma) ||
    compact.split(".").length > 2 ||
    compact.split(",").length > 2
  ) {
    return { ok: false, reason: "invalid_separators" };
  }

  const separator = hasDot ? "." : hasComma ? "," : null;
  const [rawWholePart, rawFractionPart = ""] = separator
    ? compact.split(separator)
    : [compact, ""];

  if (!/^\d+$/.test(rawWholePart)) {
    return { ok: false, reason: "invalid_whole" };
  }

  if (!/^\d*$/.test(rawFractionPart) || rawFractionPart.length > TWO_DECIMALS) {
    return { ok: false, reason: "invalid_fraction" };
  }

  const wholePart = normalizeWholePart(rawWholePart);
  const fractionPart = rawFractionPart.padEnd(TWO_DECIMALS, "0");

  const whole = Number(wholePart);
  const fraction = Number(fractionPart);

  if (!Number.isSafeInteger(whole) || !Number.isSafeInteger(fraction)) {
    return { ok: false, reason: "unsafe_number" };
  }

  const cents = whole * 100 + fraction;

  if (!Number.isSafeInteger(cents) || cents <= 0) {
    return { ok: false, reason: "non_positive" };
  }

  const normalized = buildNormalizedAmount(wholePart, fractionPart);

  return {
    ok: true,
    value: {
      amount: cents / 100,
      cents,
      normalized,
    },
  };
}

export function isPotentialCurrencyInput(rawInput: string): boolean {
  const compact = rawInput.replace(/\s+/g, "");

  if (compact.length === 0) {
    return true;
  }

  return /^\$?\d*([.,]\d{0,2})?$/.test(compact);
}
