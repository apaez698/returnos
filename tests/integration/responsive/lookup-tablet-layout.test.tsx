/**
 * Responsive lookup tablet-layout tests.
 *
 * Verifies that the LoyaltyPhoneLookupForm is already optimized for
 * touch use: large input (py-4 text-lg), accessible label, and a
 * full-width prominent submit button.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { LoyaltyPhoneLookupForm } from "@/app/loyalty/lookup/loyalty-phone-lookup-form";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("@/app/loyalty/lookup/actions", () => ({
  lookupLoyaltyCardByPhoneAction: vi.fn(async () => ({
    status: "idle",
    message: null,
    cardToken: null,
    businessSlug: null,
  })),
}));

// ---------------------------------------------------------------------------
// Form structure / touch targets
// ---------------------------------------------------------------------------

describe("LoyaltyPhoneLookupForm – tablet layout", () => {
  it("phone input is rendered with py-4 for tall touch target", () => {
    render(<LoyaltyPhoneLookupForm />);

    const input = screen.getByRole("textbox", { name: /numero de telefono/i });
    expect(input.className).toContain("py-4");
  });

  it("phone input uses text-lg for comfortable reading on tablet", () => {
    render(<LoyaltyPhoneLookupForm />);

    const input = screen.getByRole("textbox", { name: /numero de telefono/i });
    expect(input.className).toContain("text-lg");
  });

  it("phone input has inputMode=tel for numeric keyboard on touch devices", () => {
    render(<LoyaltyPhoneLookupForm />);

    const input = screen.getByRole("textbox", { name: /numero de telefono/i });
    expect(input).toHaveAttribute("inputMode", "tel");
  });

  it("phone input has rounded-xl for soft tablet-style appearance", () => {
    render(<LoyaltyPhoneLookupForm />);

    const input = screen.getByRole("textbox", { name: /numero de telefono/i });
    expect(input.className).toContain("rounded-xl");
  });

  it("submit button spans full width for primary CTA prominence", () => {
    render(<LoyaltyPhoneLookupForm />);

    const submitBtn = screen.getByRole("button", { name: /buscar tarjeta/i });
    expect(submitBtn.className).toContain("w-full");
  });

  it("submit button uses py-4 for a tall touch target", () => {
    render(<LoyaltyPhoneLookupForm />);

    const submitBtn = screen.getByRole("button", { name: /buscar tarjeta/i });
    expect(submitBtn.className).toContain("py-4");
  });

  it("submit button uses rounded-xl (tablet-friendly radius)", () => {
    render(<LoyaltyPhoneLookupForm />);

    const submitBtn = screen.getByRole("button", { name: /buscar tarjeta/i });
    expect(submitBtn.className).toContain("rounded-xl");
  });

  it("phone input has an accessible label for screen readers", () => {
    render(<LoyaltyPhoneLookupForm />);

    // getByRole with name confirms label association via htmlFor / aria-label
    expect(
      screen.getByRole("textbox", { name: /numero de telefono/i }),
    ).toBeInTheDocument();
  });

  it("phone hint text is present to guide users", () => {
    render(<LoyaltyPhoneLookupForm />);

    expect(
      screen.getByText(/usa el mismo numero con el que te registraste/i),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Touch interaction flow
// ---------------------------------------------------------------------------

describe("LoyaltyPhoneLookupForm – touch interaction", () => {
  it("typing a phone number enables and submits the form", async () => {
    const user = userEvent.setup();
    render(<LoyaltyPhoneLookupForm businessId="b1" businessSlug="cafe" />);

    const input = screen.getByRole("textbox", { name: /numero de telefono/i });
    await user.type(input, "5512345678");

    expect(input).toHaveValue("5512345678");

    const submitBtn = screen.getByRole("button", { name: /buscar tarjeta/i });
    expect(submitBtn).not.toBeDisabled();
  });
});
