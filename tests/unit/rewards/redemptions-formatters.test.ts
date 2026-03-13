import { describe, expect, it } from "vitest";
import {
  formatRedemptionDate,
  formatRedemptionValue,
} from "@/lib/rewards/redemptions-formatters";

describe("formatRedemptionDate", () => {
  it("formats a valid date with es-MX defaults", () => {
    const input = "2026-03-12T18:45:00.000Z";
    const expected = new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(input));

    expect(formatRedemptionDate(input)).toBe(expected);
  });

  it("returns fallback for empty or invalid dates", () => {
    expect(formatRedemptionDate("")).toBe("-");
    expect(formatRedemptionDate(null)).toBe("-");
    expect(formatRedemptionDate("not-a-date")).toBe("-");
  });

  it("supports custom locales", () => {
    const input = "2026-03-12T18:45:00.000Z";
    const expected = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(input));

    expect(formatRedemptionDate(input, "en-US")).toBe(expected);
  });
});

describe("formatRedemptionValue", () => {
  it("formats points with default suffix", () => {
    expect(formatRedemptionValue(250)).toBe("250 pts");
  });

  it("formats fallback points when value is invalid", () => {
    expect(formatRedemptionValue(undefined)).toBe("0 pts");
    expect(formatRedemptionValue(Number.NaN)).toBe("0 pts");
  });

  it("formats cashback as currency", () => {
    const expected = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(35.5);

    expect(formatRedemptionValue(35.5, { mode: "cashback" })).toBe(expected);
  });

  it("formats invalid cashback values as zero currency", () => {
    const expected = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0);

    expect(
      formatRedemptionValue(Number.POSITIVE_INFINITY, { mode: "cashback" }),
    ).toBe(expected);
  });

  it("supports custom currency and locale for cashback", () => {
    const expected = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(10);

    expect(
      formatRedemptionValue(10, {
        mode: "cashback",
        currency: "USD",
        locale: "en-US",
      }),
    ).toBe(expected);
  });
});
