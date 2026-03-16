import { createCustomerSchema } from "@/lib/customers/schema";

describe("createCustomerSchema", () => {
  const validCustomer = {
    name: "Ana Perez",
    phone: "+52 55 1234 5678",
    email: "ana@example.com",
    birthday: "1992-06-10",
    consent_marketing: true,
  };

  it("accepts valid customer input", () => {
    const result = createCustomerSchema.safeParse(validCustomer);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+525512345678");
    }
  });

  it("fails when phone only has separators", () => {
    const result = createCustomerSchema.safeParse({
      ...validCustomer,
      phone: " ( ) - . ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["phone"]);
    }
  });

  it("fails when name is empty", () => {
    const result = createCustomerSchema.safeParse({
      ...validCustomer,
      name: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["name"]);
    }
  });

  it("fails when email is invalid", () => {
    const result = createCustomerSchema.safeParse({
      ...validCustomer,
      email: "ana-at-example.com",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["email"]);
    }
  });

  it("fails when birthday is in the future", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const result = createCustomerSchema.safeParse({
      ...validCustomer,
      birthday: futureDate.toISOString().slice(0, 10),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["birthday"]);
    }
  });

  it("accepts input when optional email and birthday are omitted", () => {
    const result = createCustomerSchema.safeParse({
      name: "Ana Perez",
      phone: "+52 55 1234 5678",
      consent_marketing: false,
    });

    expect(result.success).toBe(true);
  });
});
