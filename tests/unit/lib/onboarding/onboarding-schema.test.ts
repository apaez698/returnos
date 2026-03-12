import { createBusinessOwnerInputSchema } from "@/lib/onboarding/onboarding-schema";

describe("createBusinessOwnerInputSchema", () => {
  it("accepts valid onboarding data", () => {
    const result = createBusinessOwnerInputSchema.safeParse({
      businessName: "Panaderia La Delicia",
      businessType: "bakery",
    });

    expect(result.success).toBe(true);
  });

  it("fails when businessName is empty", () => {
    const result = createBusinessOwnerInputSchema.safeParse({
      businessName: "",
      businessType: "bakery",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["businessName"]);
    }
  });

  it("fails when businessType is missing", () => {
    const result = createBusinessOwnerInputSchema.safeParse({
      businessName: "Cafeteria Centro",
      businessType: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["businessType"]);
    }
  });

  it("fails when businessType is not supported", () => {
    const result = createBusinessOwnerInputSchema.safeParse({
      businessName: "Cocina Norte",
      businessType: "food-truck",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["businessType"]);
    }
  });
});
