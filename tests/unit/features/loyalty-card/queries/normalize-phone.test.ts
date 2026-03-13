import { describe, expect, it } from "vitest";
import { normalizePhone } from "@/features/loyalty-card/queries/normalize-phone";

describe("normalizePhone", () => {
  it("trims leading and trailing whitespace", () => {
    expect(normalizePhone("  5512345678  ")).toBe("5512345678");
  });

  it("removes common phone separators", () => {
    expect(normalizePhone("+52 (55) 1234-56.78")).toBe("+525512345678");
  });

  it("returns empty string when input only has spaces", () => {
    expect(normalizePhone("    ")).toBe("");
  });

  it("returns empty string when input only has separators", () => {
    expect(normalizePhone("  - . ( )  ")).toBe("");
  });
});
