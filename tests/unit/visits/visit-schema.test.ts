import { visitRegistrationSchema } from "@/lib/visits/schema";
import { describe, it, expect } from "vitest";

describe("visitRegistrationSchema", () => {
  const validVisit = {
    customer_id: "cust_123",
    points_earned: 50,
    amount: 100.5,
    product_category: "Electronics",
    source: "in_store" as const,
  };

  describe("valid input", () => {
    it("accepts complete valid visit", () => {
      const result = visitRegistrationSchema.safeParse(validVisit);

      expect(result.success).toBe(true);
    });

    it("accepts visit with required fields only", () => {
      const result = visitRegistrationSchema.safeParse({
        customer_id: "cust_456",
        points_earned: 0,
        source: "manual",
      });

      expect(result.success).toBe(true);
    });

    it("accepts visit with zero points earned", () => {
      const result = visitRegistrationSchema.safeParse({
        ...validVisit,
        points_earned: 0,
      });

      expect(result.success).toBe(true);
    });

    it("accepts visit with zero amount", () => {
      const result = visitRegistrationSchema.safeParse({
        ...validVisit,
        amount: 0,
      });

      expect(result.success).toBe(true);
    });

    it("accepts visit with whitespace-only customer_id after trimming", () => {
      const result = visitRegistrationSchema.safeParse({
        ...validVisit,
        customer_id: "  cust_789  ",
      });

      expect(result.success).toBe(true);
    });

    it("accepts visit with whitespace-only product_category after trimming", () => {
      const result = visitRegistrationSchema.safeParse({
        ...validVisit,
        product_category: "  Clothing  ",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("customer_id validation", () => {
    it("fails when customer_id is empty", () => {
      const result = visitRegistrationSchema.safeParse({
        ...validVisit,
        customer_id: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["customer_id"]);
      }
    });

    it("fails when customer_id is only whitespace", () => {
      const result = visitRegistrationSchema.safeParse({
        ...validVisit,
        customer_id: "   ",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["customer_id"]);
      }
    });

    it("fails when customer_id is missing", () => {
      const result = visitRegistrationSchema.safeParse({
        points_earned: 50,
        source: "in_store",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["customer_id"]);
      }
    });
  });

  describe("points_earned validation", () => {
    it("fails when points_earned is negative", () => {
      const result = visitRegistrationSchema.safeParse({
        ...validVisit,
        points_earned: -1,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["points_earned"]);
      }
    });

    it("fails when points_earned is a float", () => {
      const result = visitRegistrationSchema.safeParse({
        ...validVisit,
        points_earned: 50.5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["points_earned"]);
      }
    });

    it("fails when points_earned is missing", () => {
      const result = visitRegistrationSchema.safeParse({
        customer_id: "cust_123",
        source: "in_store",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["points_earned"]);
      }
    });
  });

  describe("amount validation", () => {
    it("fails when amount is negative", () => {
      const result = visitRegistrationSchema.safeParse({
        ...validVisit,
        amount: -0.01,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["amount"]);
      }
    });

    it("accepts visit when amount is omitted", () => {
      const { amount, ...dataWithoutAmount } = validVisit;
      const result = visitRegistrationSchema.safeParse(dataWithoutAmount);

      expect(result.success).toBe(true);
    });

    it("accepts visit when amount is null or undefined", () => {
      const result = visitRegistrationSchema.safeParse({
        ...validVisit,
        amount: undefined,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("source validation", () => {
    it("fails when source is invalid", () => {
      const result = visitRegistrationSchema.safeParse({
        ...validVisit,
        source: "phone" as any,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["source"]);
      }
    });

    it("fails when source is missing", () => {
      const result = visitRegistrationSchema.safeParse({
        customer_id: "cust_123",
        points_earned: 50,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["source"]);
      }
    });

    it("accepts all valid source values", () => {
      const validSources = ["manual", "in_store", "qr"] as const;

      validSources.forEach((source) => {
        const result = visitRegistrationSchema.safeParse({
          ...validVisit,
          source,
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe("product_category validation", () => {
    it("accepts visit when product_category is omitted", () => {
      const { product_category, ...dataWithoutCategory } = validVisit;
      const result = visitRegistrationSchema.safeParse(dataWithoutCategory);

      expect(result.success).toBe(true);
    });

    it("accepts empty string as product_category", () => {
      const result = visitRegistrationSchema.safeParse({
        ...validVisit,
        product_category: "",
      });

      expect(result.success).toBe(true);
    });

    it("trims whitespace from product_category", () => {
      const result = visitRegistrationSchema.safeParse({
        ...validVisit,
        product_category: "  trimmed  ",
      });

      if (result.success) {
        expect(result.data.product_category).toBe("trimmed");
      }
    });
  });
});
