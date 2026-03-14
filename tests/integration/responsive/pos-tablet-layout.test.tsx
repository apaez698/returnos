/**
 * Responsive POS tablet-layout tests.
 *
 * Verifies that the PosPurchaseForm and CustomerSearch components carry the
 * right structural CSS classes for tablet-first UX (touch targets, md-grid
 * split, readable inputs) and behave correctly when operated via touch-style
 * sequential taps.
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { PosPurchaseForm } from "@/components/pos/pos-purchase-form";
import { CustomerSearch } from "@/components/pos/customer-search";
import {
  PosCustomer,
  PosPurchaseActionState,
  initialPosPurchaseActionState,
} from "@/lib/pos/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CUSTOMERS: PosCustomer[] = [
  {
    id: "c1",
    name: "Ana Perez",
    phone: "+521111111111",
    points: 80,
    last_visit_at: null,
  },
  {
    id: "c2",
    name: "Carlos Gomez",
    phone: "+529990001111",
    points: 200,
    last_visit_at: "2026-03-10T09:00:00Z",
  },
];

function idleAction() {
  return vi.fn(
    async (): Promise<PosPurchaseActionState> => initialPosPurchaseActionState,
  );
}

// ---------------------------------------------------------------------------
// Layout / structure
// ---------------------------------------------------------------------------

describe("POS tablet layout – structure", () => {
  it("renders the two-column tablet grid inside the form section", () => {
    const { container } = render(
      <PosPurchaseForm initialCustomers={CUSTOMERS} action={idleAction()} />,
    );

    // twoColTabletGrid includes "md:grid-cols-2" – verify the grid container exists
    const gridEl = container.querySelector(".md\\:grid-cols-2");
    expect(gridEl).toBeInTheDocument();
  });

  it("submit button carries primary touch-target classes (min-h-[52px])", () => {
    render(
      <PosPurchaseForm initialCustomers={CUSTOMERS} action={idleAction()} />,
    );

    const submitBtn = screen.getByRole("button", { name: /registrar compra/i });
    expect(submitBtn.className).toContain("min-h-[52px]");
  });

  it("amount input uses large single-field amount styling", () => {
    render(
      <PosPurchaseForm initialCustomers={CUSTOMERS} action={idleAction()} />,
    );

    const amountInput = screen.getByLabelText("Monto");
    expect(amountInput.className).toContain("min-h-[92px]");
    expect(amountInput.className).toContain("text-4xl");
  });

  it("amount input has inputMode=decimal for numeric keyboard on touch devices", () => {
    render(
      <PosPurchaseForm initialCustomers={CUSTOMERS} action={idleAction()} />,
    );

    expect(screen.getByLabelText("Monto")).toHaveAttribute(
      "inputMode",
      "decimal",
    );
  });

  it("amount-stepper buttons are touch friendly (min-h-[52px])", async () => {
    render(
      <PosPurchaseForm initialCustomers={CUSTOMERS} action={idleAction()} />,
    );

    const stepperButtons = [
      /reducir monto en 1\.00/i,
      /reducir monto en 0\.10/i,
      /reducir monto en 0\.05/i,
      /reducir monto en 0\.01/i,
      /aumentar monto en 0\.01/i,
      /aumentar monto en 0\.05/i,
      /aumentar monto en 0\.10/i,
      /aumentar monto en 0\.25/i,
      /aumentar monto en 0\.50/i,
      /aumentar monto en 1\.00/i,
    ].map((name) => screen.getByRole("button", { name }));

    expect(stepperButtons.length).toBe(10);
    for (const btn of stepperButtons) {
      expect(btn.className).toContain("min-h-[52px]");
    }
  });

  it("customer list items carry touch-target row classes (min-h-[52px])", () => {
    render(
      <PosPurchaseForm initialCustomers={CUSTOMERS} action={idleAction()} />,
    );

    const customerBtn = screen.getByRole("button", { name: /ana perez/i });
    expect(customerBtn.className).toContain("min-h-[52px]");
  });

  it("search input is rounded-xl (tablet-style) and carries touch input classes", () => {
    render(
      <PosPurchaseForm initialCustomers={CUSTOMERS} action={idleAction()} />,
    );

    const searchInput = screen.getByRole("searchbox");
    expect(searchInput.className).toContain("rounded-xl");
    expect(searchInput.className).toContain("py-3");
  });
});

// ---------------------------------------------------------------------------
// Touch interaction flow
// ---------------------------------------------------------------------------

describe("POS tablet layout – touch interaction flow", () => {
  it("tap customer -> tap amount stepper -> submit is a complete reliable flow", async () => {
    const action = vi.fn(
      async (): Promise<PosPurchaseActionState> =>
        initialPosPurchaseActionState,
    );
    const user = userEvent.setup();
    render(<PosPurchaseForm initialCustomers={CUSTOMERS} action={action} />);

    // Step 1: tap customer row
    await user.click(screen.getByRole("button", { name: /ana perez/i }));

    // Step 2: tap amount-stepper button
    await user.click(
      screen.getByRole("button", { name: /aumentar monto en 1\.00/i }),
    );

    // Step 3: submit
    await user.click(screen.getByRole("button", { name: /registrar compra/i }));

    expect(action).toHaveBeenCalledOnce();
  });

  it("selected customer card shows name and points prominently after tap", async () => {
    const user = userEvent.setup();
    render(
      <PosPurchaseForm initialCustomers={CUSTOMERS} action={idleAction()} />,
    );

    await user.click(screen.getByRole("button", { name: /carlos gomez/i }));

    const nameEls = screen.getAllByText(/carlos gomez/i);
    expect(nameEls.length).toBeGreaterThanOrEqual(1);

    const ptBadges = screen.getAllByText(/200 pts/i);
    expect(ptBadges.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// CustomerSearch standalone touch checks
// ---------------------------------------------------------------------------

describe("CustomerSearch – touch targets", () => {
  it("customer buttons carry touch list-row min height", () => {
    render(
      <CustomerSearch
        query=""
        customers={CUSTOMERS}
        selectedCustomer={null}
        isLoading={false}
        hasSearched={false}
        onQueryChange={vi.fn()}
        onSelectCustomer={vi.fn()}
      />,
    );

    const btn = screen.getByRole("button", { name: /ana perez/i });
    expect(btn.className).toContain("min-h-[52px]");
  });

  it("list container has a generous max-height for tablet scroll", () => {
    const { container } = render(
      <CustomerSearch
        query=""
        customers={CUSTOMERS}
        selectedCustomer={null}
        isLoading={false}
        hasSearched={false}
        onQueryChange={vi.fn()}
        onSelectCustomer={vi.fn()}
      />,
    );

    // md:max-h-[360px] is applied via Tailwind class on the <ul>
    const ul = container.querySelector("ul");
    expect(ul?.className).toContain("md:max-h-");
  });
});
