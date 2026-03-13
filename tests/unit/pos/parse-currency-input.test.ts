import { describe, expect, it } from "vitest";
import {
  isPotentialCurrencyInput,
  parseCurrencyInput,
} from "@/lib/pos/parse-currency-input";

describe("parseCurrencyInput", () => {
  it("parses valid decimal amounts and normalizes to 2 decimals", () => {
    expect(parseCurrencyInput("0.35")).toEqual({
      ok: true,
      value: { amount: 0.35, cents: 35, normalized: "0.35" },
    });

    expect(parseCurrencyInput("1.2")).toEqual({
      ok: true,
      value: { amount: 1.2, cents: 120, normalized: "1.20" },
    });

    expect(parseCurrencyInput("2.75")).toEqual({
      ok: true,
      value: { amount: 2.75, cents: 275, normalized: "2.75" },
    });

    expect(parseCurrencyInput("4.50")).toEqual({
      ok: true,
      value: { amount: 4.5, cents: 450, normalized: "4.50" },
    });
  });

  it("accepts comma decimal separator", () => {
    expect(parseCurrencyInput("1,20")).toEqual({
      ok: true,
      value: { amount: 1.2, cents: 120, normalized: "1.20" },
    });
  });

  it("rejects invalid values", () => {
    expect(parseCurrencyInput("")).toEqual({ ok: false, reason: "empty" });
    expect(parseCurrencyInput("abc")).toEqual({
      ok: false,
      reason: "invalid_characters",
    });
    expect(parseCurrencyInput("1.999")).toEqual({
      ok: false,
      reason: "invalid_fraction",
    });
    expect(parseCurrencyInput("0")).toEqual({
      ok: false,
      reason: "non_positive",
    });
    expect(parseCurrencyInput("1.2.3")).toEqual({
      ok: false,
      reason: "invalid_separators",
    });
  });
});

describe("isPotentialCurrencyInput", () => {
  it("allows partial typing states", () => {
    expect(isPotentialCurrencyInput("")).toBe(true);
    expect(isPotentialCurrencyInput("1")).toBe(true);
    expect(isPotentialCurrencyInput("1.")).toBe(true);
    expect(isPotentialCurrencyInput("1.2")).toBe(true);
    expect(isPotentialCurrencyInput("1,2")).toBe(true);
  });

  it("rejects unsupported typing states", () => {
    expect(isPotentialCurrencyInput("1.234")).toBe(false);
    expect(isPotentialCurrencyInput("$1.20.1")).toBe(false);
    expect(isPotentialCurrencyInput("1a")).toBe(false);
  });
});
