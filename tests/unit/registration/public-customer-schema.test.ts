import { createCustomerSchema } from "@/lib/customers/schema";

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

describe("public customer registration schema", () => {
  const validInput = {
    name: "Ana Perez",
    phone: "+52 55 1234 5678",
    email: "ana@example.com",
    birthday: "1992-06-10",
    consent_marketing: true,
  };

  it("accepts valid input", () => {
    const result = createCustomerSchema.safeParse(validInput);

    expect(result.success).toBe(true);
  });

  it("fails when name is empty", () => {
    const result = createCustomerSchema.safeParse({ ...validInput, name: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["name"]);
      expect(result.error.issues[0]?.message).toMatch(/2 caracteres/);
    }
  });

  it("fails when name is only whitespace", () => {
    const result = createCustomerSchema.safeParse({
      ...validInput,
      name: "   ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["name"]);
    }
  });

  it("fails when email is invalid", () => {
    const result = createCustomerSchema.safeParse({
      ...validInput,
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["email"]);
      expect(result.error.issues[0]?.message).toMatch(/correo valido/);
    }
  });

  it("fails when birthday is in the future", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureDateStr = toLocalDateString(tomorrow);

    const result = createCustomerSchema.safeParse({
      ...validInput,
      birthday: futureDateStr,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["birthday"]);
      expect(result.error.issues[0]?.message).toMatch(/fecha pasada/);
    }
  });

  it("accepts today as a valid birthday", () => {
    const today = toLocalDateString(new Date());

    const result = createCustomerSchema.safeParse({
      ...validInput,
      birthday: today,
    });

    expect(result.success).toBe(true);
  });

  it("accepts input when optional email and birthday are omitted", () => {
    const result = createCustomerSchema.safeParse({
      name: "Ana Perez",
      phone: "+52 55 1234 5678",
      consent_marketing: false,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBeUndefined();
      expect(result.data.birthday).toBeUndefined();
    }
  });

  it("defaults consent_marketing to false when omitted", () => {
    const result = createCustomerSchema.safeParse({
      name: "Ana Perez",
      phone: "+52 55 1234 5678",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.consent_marketing).toBe(false);
    }
  });
});
