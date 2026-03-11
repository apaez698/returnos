import {
  getEmailValidationError,
  isValidEmail,
  normalizeEmail,
} from "@/lib/auth/validation";

describe("auth email validation", () => {
  it("normalizes by trimming and lowercasing", () => {
    expect(normalizeEmail("  USER@Example.COM ")).toBe("user@example.com");
  });

  it("accepts a valid email", () => {
    expect(isValidEmail("owner@bakery.com")).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(isValidEmail("owner-at-bakery.com")).toBe(false);
  });

  it("returns required message for empty email", () => {
    expect(getEmailValidationError("")).toBe("El correo es obligatorio.");
  });

  it("returns invalid message for malformed email", () => {
    expect(getEmailValidationError("owner-at-bakery.com")).toBe(
      "Ingresa un correo valido.",
    );
  });

  it("returns null for valid email", () => {
    expect(getEmailValidationError("owner@bakery.com")).toBeNull();
  });
});
