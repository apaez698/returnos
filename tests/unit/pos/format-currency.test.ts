import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/lib/pos/format-currency";

describe("formatCurrency", () => {
  it("formats with es-MX MXN defaults and two decimals", () => {
    expect(formatCurrency(0.35)).toBe("$0.35");
    expect(formatCurrency(1.2)).toBe("$1.20");
    expect(formatCurrency(2.75)).toBe("$2.75");
    expect(formatCurrency(4.5)).toBe("$4.50");
  });

  it("supports custom locale and currency", () => {
    expect(formatCurrency(12.5, { locale: "en-US", currency: "USD" })).toBe(
      "$12.50",
    );
  });
});
