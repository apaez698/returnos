import { describe, expect, it } from "vitest";
import { loyaltyPhoneSchema } from "@/features/loyalty-card/queries/loyalty-phone-schema";

describe("loyaltyPhoneSchema", () => {
  it("accepts a valid phone and returns normalized value", () => {
    const result = loyaltyPhoneSchema.safeParse(" +52 (55) 1234-5678 ");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("+525512345678");
    }
  });

  it("fails when phone is empty", () => {
    const result = loyaltyPhoneSchema.safeParse("   ");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Ingresa tu numero de telefono para continuar.",
      );
    }
  });

  it("fails when phone has too few digits", () => {
    const result = loyaltyPhoneSchema.safeParse("55-123");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Ingresa un numero valido de 8 a 15 digitos.",
      );
    }
  });
});
