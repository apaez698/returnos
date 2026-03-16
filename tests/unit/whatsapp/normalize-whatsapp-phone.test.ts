import { describe, expect, it } from "vitest";

import { normalizeWhatsAppPhone } from "@/features/whatsapp/utils/normalize-whatsapp-phone";

describe("normalizeWhatsAppPhone", () => {
  it("trims and removes common separators", () => {
    expect(normalizeWhatsAppPhone("  +52 (55) 1234-56.78  ")).toBe(
      "+525512345678",
    );
  });

  it("returns empty string for blank input", () => {
    expect(normalizeWhatsAppPhone("   ")).toBe("");
  });

  it("returns empty string when no digits are present", () => {
    expect(normalizeWhatsAppPhone("  - . ( )  ")).toBe("");
  });

  it("keeps digits when no country code is provided", () => {
    expect(normalizeWhatsAppPhone("(300) 111-2233")).toBe("3001112233");
  });

  it("prepends default country code when provided", () => {
    expect(
      normalizeWhatsAppPhone("300 111 2233", {
        defaultCountryCode: "+57",
      }),
    ).toBe("+573001112233");
  });
});
