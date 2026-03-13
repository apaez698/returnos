import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { PosPurchaseForm } from "@/components/pos/pos-purchase-form";
import {
  PosCustomer,
  PosPurchaseActionState,
  initialPosPurchaseActionState,
} from "@/lib/pos/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CUSTOMER: PosCustomer = {
  id: "customer-1",
  name: "Ana Perez",
  phone: "+521111111111",
  points: 20,
  last_visit_at: null,
};

const CUSTOMER_B: PosCustomer = {
  id: "customer-2",
  name: "Carlos Gomez",
  phone: "+529998887777",
  points: 150,
  last_visit_at: "2026-03-10T10:00:00Z",
};

/** Returns a no-op action that always resolves to "idle". */
function idleAction() {
  return vi.fn(
    async (): Promise<PosPurchaseActionState> => initialPosPurchaseActionState,
  );
}

/** Helper: render the form and select a customer from the list. */
async function renderAndSelectCustomer(
  action: ReturnType<typeof idleAction>,
  customer: PosCustomer = CUSTOMER,
  customers: PosCustomer[] = [CUSTOMER],
) {
  const user = userEvent.setup();
  render(<PosPurchaseForm initialCustomers={customers} action={action} />);
  await user.click(
    screen.getByRole("button", { name: new RegExp(customer.name, "i") }),
  );
  return user;
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe("PosPurchaseForm", () => {
  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------
  describe("initial state", () => {
    it("renders the section heading", () => {
      render(
        <PosPurchaseForm initialCustomers={[CUSTOMER]} action={idleAction()} />,
      );
      expect(
        screen.getByRole("heading", { name: /caja \/ pos/i }),
      ).toBeInTheDocument();
    });

    it("lists available customers in the search panel", () => {
      render(
        <PosPurchaseForm
          initialCustomers={[CUSTOMER, CUSTOMER_B]}
          action={idleAction()}
        />,
      );
      expect(
        screen.getByRole("button", { name: /ana perez/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /carlos gomez/i }),
      ).toBeInTheDocument();
    });

    it("shows placeholder text when no customer is selected", () => {
      render(
        <PosPurchaseForm initialCustomers={[CUSTOMER]} action={idleAction()} />,
      );
      expect(
        screen.getAllByText(/selecciona un cliente/i).length,
      ).toBeGreaterThan(0);
    });

    it("submit button is present but disabled before selection", () => {
      render(
        <PosPurchaseForm initialCustomers={[CUSTOMER]} action={idleAction()} />,
      );
      expect(
        screen.getByRole("button", { name: /registrar compra/i }),
      ).toBeDisabled();
    });

    it("amount input is disabled until a customer is selected", () => {
      render(
        <PosPurchaseForm initialCustomers={[CUSTOMER]} action={idleAction()} />,
      );
      expect(screen.getByLabelText("Monto")).toBeDisabled();
    });
  });

  // -------------------------------------------------------------------------
  // Customer selection
  // -------------------------------------------------------------------------
  describe("customer selection", () => {
    it("shows selected customer name in the right-side panel", async () => {
      await renderAndSelectCustomer(idleAction());

      // The right panel "Cliente seleccionado" area renders the name as text
      const nameEls = screen.getAllByText(/ana perez/i);
      expect(nameEls.length).toBeGreaterThanOrEqual(1);
    });

    it("shows selected customer phone in the right-side panel", async () => {
      await renderAndSelectCustomer(idleAction());

      await waitFor(() => {
        expect(screen.getAllByText(/\+521111111111/).length).toBeGreaterThan(0);
      });
    });

    it("shows selected customer points badge", async () => {
      await renderAndSelectCustomer(idleAction());

      await waitFor(() => {
        expect(screen.getAllByText(/20 pts/i).length).toBeGreaterThan(0);
      });
    });

    it("enables the amount input after selecting a customer", async () => {
      await renderAndSelectCustomer(idleAction());

      await waitFor(() => {
        expect(screen.getByLabelText("Monto")).toBeEnabled();
      });
    });

    it("enables the submit button after selecting a customer", async () => {
      await renderAndSelectCustomer(idleAction());

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /registrar compra/i }),
        ).toBeEnabled();
      });
    });

    it("populates the search input with the selected customer's name", async () => {
      await renderAndSelectCustomer(idleAction());

      await waitFor(() => {
        const searchInput = screen.getByRole("searchbox");
        expect(searchInput).toHaveValue(CUSTOMER.name);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Validation errors returned from the server action
  // -------------------------------------------------------------------------
  describe("validation errors", () => {
    it("shows an amount field error when the action returns one", async () => {
      const action = vi.fn(
        async (): Promise<PosPurchaseActionState> => ({
          status: "error",
          fieldErrors: { amount: "El monto debe ser mayor a cero." },
        }),
      );
      const user = await renderAndSelectCustomer(action);

      await user.type(screen.getByLabelText("Monto"), "0");
      await user.click(
        screen.getByRole("button", { name: /registrar compra/i }),
      );

      expect(
        await screen.findByText(/el monto debe ser mayor a cero/i),
      ).toBeInTheDocument();
    });

    it("shows a customer_id field error when the action returns one", async () => {
      const action = vi.fn(
        async (): Promise<PosPurchaseActionState> => ({
          status: "error",
          fieldErrors: { customer_id: "Selecciona un cliente válido." },
        }),
      );
      const user = await renderAndSelectCustomer(action);

      await user.type(screen.getByLabelText("Monto"), "50");
      await user.click(
        screen.getByRole("button", { name: /registrar compra/i }),
      );

      expect(
        await screen.findByText(/selecciona un cliente válido/i),
      ).toBeInTheDocument();
    });

    it("shows a generic error message when the action returns status=error", async () => {
      const action = vi.fn(
        async (): Promise<PosPurchaseActionState> => ({
          status: "error",
          message: "No se pudo registrar la compra.",
        }),
      );
      const user = await renderAndSelectCustomer(action);

      await user.type(screen.getByLabelText("Monto"), "100");
      await user.click(
        screen.getByRole("button", { name: /registrar compra/i }),
      );

      expect(
        await screen.findByText(/no se pudo registrar la compra/i),
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Valid submission
  // -------------------------------------------------------------------------
  describe("valid submission", () => {
    it("calls the action when form is submitted with customer and amount", async () => {
      const action = vi.fn(
        async (): Promise<PosPurchaseActionState> =>
          initialPosPurchaseActionState,
      );
      const user = await renderAndSelectCustomer(action);

      await user.type(screen.getByLabelText("Monto"), "75");
      await user.click(
        screen.getByRole("button", { name: /registrar compra/i }),
      );

      await waitFor(() => {
        expect(action).toHaveBeenCalledTimes(1);
      });
    });

    it("passes the selected customer_id hidden field to the action", async () => {
      let capturedFormData: FormData | null = null;
      const action = vi.fn(
        async (
          _prev: unknown,
          formData: FormData,
        ): Promise<PosPurchaseActionState> => {
          capturedFormData = formData;
          return initialPosPurchaseActionState;
        },
      );
      const user = await renderAndSelectCustomer(action);

      await user.type(screen.getByLabelText("Monto"), "30");
      await user.click(
        screen.getByRole("button", { name: /registrar compra/i }),
      );

      await waitFor(() => expect(capturedFormData).not.toBeNull());
      expect(capturedFormData!.get("customer_id")).toBe(CUSTOMER.id);
    });

    it("passes the entered amount to the action", async () => {
      let capturedFormData: FormData | null = null;
      const action = vi.fn(
        async (
          _prev: unknown,
          formData: FormData,
        ): Promise<PosPurchaseActionState> => {
          capturedFormData = formData;
          return initialPosPurchaseActionState;
        },
      );
      const user = await renderAndSelectCustomer(action);

      await user.type(screen.getByLabelText("Monto"), "99.5");
      await user.click(
        screen.getByRole("button", { name: /registrar compra/i }),
      );

      await waitFor(() => expect(capturedFormData).not.toBeNull());
      expect(capturedFormData!.get("amount")).toBe("99.5");
    });
  });

  // -------------------------------------------------------------------------
  // Success summary (PurchaseSuccessCard)
  // -------------------------------------------------------------------------
  describe("success summary", () => {
    async function submitAndGetSuccess(
      unlockedRewardName: string | null = null,
    ) {
      const action = vi.fn(
        async (): Promise<PosPurchaseActionState> => ({
          status: "success",
          receipt: {
            customerId: CUSTOMER.id,
            customerName: CUSTOMER.name,
            amount: 50,
            pointsEarned: 50,
            updatedPoints: 70,
            unlockedRewardName,
          },
        }),
      );
      const user = await renderAndSelectCustomer(action);
      await user.type(screen.getByLabelText("Monto"), "50");
      await user.click(
        screen.getByRole("button", { name: /registrar compra/i }),
      );
    }

    it("shows 'Compra registrada correctamente' heading on success", async () => {
      await submitAndGetSuccess();
      expect(await screen.findByText("Compra registrada")).toBeInTheDocument();
    });

    it("shows the customer name in the success card", async () => {
      await submitAndGetSuccess();
      await screen.findByText("Compra registrada");
      // Customer name appears both in the selected panel and in the receipt
      expect(screen.getAllByText(/ana perez/i).length).toBeGreaterThan(0);
    });

    it("shows the formatted purchase amount in the success card", async () => {
      await submitAndGetSuccess();
      await screen.findByText("Compra registrada");
      // es-MX currency format for 50
      expect(screen.getByText(/\$50\.00/)).toBeInTheDocument();
    });

    it("shows points earned in the success card", async () => {
      await submitAndGetSuccess();
      await screen.findByText("Compra registrada");
      expect(screen.getByText("+50")).toBeInTheDocument();
    });

    it("shows updated total points in the success card", async () => {
      await submitAndGetSuccess();
      await screen.findByText("Compra registrada");
      expect(screen.getByText("70")).toBeInTheDocument();
    });

    it("shows unlocked reward name when a reward is earned", async () => {
      await submitAndGetSuccess("Café gratis");
      expect(
        await screen.findByText(/Recompensa disponible: Café gratis/i),
      ).toBeInTheDocument();
    });

    it("does not show a reward message when no reward was unlocked", async () => {
      await submitAndGetSuccess(null);
      await screen.findByText("Compra registrada");
      expect(
        screen.queryByText(/Recompensa disponible/i),
      ).not.toBeInTheDocument();
    });

    it("clears the amount field after a successful submission", async () => {
      await submitAndGetSuccess();
      await screen.findByText("Compra registrada");
      await waitFor(() => {
        expect(screen.getByLabelText("Monto")).toHaveValue(null);
      });
    });

    it("hides the success summary when clicking 'Registrar otra compra'", async () => {
      await submitAndGetSuccess();
      await screen.findByText("Compra registrada");

      const registerAnotherButton = screen.getByRole("button", {
        name: /registrar otra compra/i,
      });
      await userEvent.click(registerAnotherButton);

      expect(screen.queryByText("Compra registrada")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Monto")).toHaveValue(null);
    });
  });

  // -------------------------------------------------------------------------
  // Search filtering
  // -------------------------------------------------------------------------
  describe("customer search filtering", () => {
    it("filters the customer list by name", async () => {
      const user = userEvent.setup();
      render(
        <PosPurchaseForm
          initialCustomers={[CUSTOMER, CUSTOMER_B]}
          action={idleAction()}
        />,
      );

      await user.type(screen.getByRole("searchbox"), "carlos");

      await waitFor(() => {
        expect(
          screen.queryByRole("button", { name: /ana perez/i }),
        ).not.toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /carlos gomez/i }),
        ).toBeInTheDocument();
      });
    });

    it("filters the customer list by phone number", async () => {
      const user = userEvent.setup();
      render(
        <PosPurchaseForm
          initialCustomers={[CUSTOMER, CUSTOMER_B]}
          action={idleAction()}
        />,
      );

      await user.type(screen.getByRole("searchbox"), "999888");

      await waitFor(() => {
        expect(
          screen.queryByRole("button", { name: /ana perez/i }),
        ).not.toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /carlos gomez/i }),
        ).toBeInTheDocument();
      });
    });

    it("shows no-results message when search returns nothing", async () => {
      const user = userEvent.setup();
      render(
        <PosPurchaseForm initialCustomers={[CUSTOMER]} action={idleAction()} />,
      );

      await user.type(screen.getByRole("searchbox"), "zzznomatch");

      await waitFor(() => {
        expect(
          screen.getByText(/no se encontraron clientes con ese criterio/i),
        ).toBeInTheDocument();
      });
    });
  });
});
