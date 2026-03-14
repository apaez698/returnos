import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { PosPurchaseForm } from "@/components/pos/pos-purchase-form";
import {
  initialPosCreateCustomerActionState,
  PosCustomer,
  PosCreateCustomerActionState,
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

function idleCreateCustomerAction() {
  return vi.fn(
    async (): Promise<PosCreateCustomerActionState> =>
      initialPosCreateCustomerActionState,
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
    it("renders the POS helper copy", () => {
      render(
        <PosPurchaseForm initialCustomers={[CUSTOMER]} action={idleAction()} />,
      );
      expect(
        screen.getByText(/busca cliente, selecciona y registra la compra/i),
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

    it("keeps submit disabled after selecting customer until amount is valid", async () => {
      await renderAndSelectCustomer(idleAction());

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /registrar compra/i }),
        ).toBeDisabled();
      });
    });

    it("enables submit button when a valid decimal amount is entered", async () => {
      const user = await renderAndSelectCustomer(idleAction());

      await user.type(screen.getByLabelText("Monto"), "2.75");

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

      await user.type(screen.getByLabelText("Monto"), "0.10");
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
      expect(capturedFormData!.get("amount")).toBe("99.50");
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
        expect(screen.getByLabelText("Monto")).toHaveValue("");
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
      expect(screen.getByLabelText("Monto")).toHaveValue("");
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
          screen.getByText(/no encontramos un cliente para esta busqueda/i),
        ).toBeInTheDocument();
      });
    });

    it("shows create-customer CTA when no results and inline creation is enabled", async () => {
      const user = userEvent.setup();
      render(
        <PosPurchaseForm
          initialCustomers={[CUSTOMER]}
          action={idleAction()}
          createCustomerAction={idleCreateCustomerAction()}
        />,
      );

      await user.type(screen.getByRole("searchbox"), "zzznomatch");

      expect(
        await screen.findByRole("button", { name: /crear cliente nuevo/i }),
      ).toBeInTheDocument();
    });

    it("opens inline create modal and auto-selects the created customer", async () => {
      const user = userEvent.setup();
      const createCustomerAction = vi.fn(
        async (
          _previousState: PosCreateCustomerActionState,
          formData: FormData,
        ): Promise<PosCreateCustomerActionState> => ({
          status: "success",
          customer: {
            id: "customer-new",
            name: String(formData.get("name") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            points: 0,
            last_visit_at: null,
          },
        }),
      );

      render(
        <PosPurchaseForm
          initialCustomers={[CUSTOMER]}
          action={idleAction()}
          createCustomerAction={createCustomerAction}
        />,
      );

      await user.type(screen.getByRole("searchbox"), "Cliente Nuevo");
      await user.click(
        await screen.findByRole("button", { name: /crear cliente nuevo/i }),
      );

      expect(
        await screen.findByRole("heading", { name: /crear cliente/i }),
      ).toBeInTheDocument();

      const phoneInput = screen.getByLabelText("Telefono");
      await user.type(phoneInput, "+521234000999");
      await user.click(
        screen.getByRole("button", { name: /guardar y seleccionar/i }),
      );

      await waitFor(() => {
        expect(createCustomerAction).toHaveBeenCalledTimes(1);
      });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("searchbox")).toHaveValue("Cliente Nuevo");
      expect(screen.getAllByText(/cliente nuevo/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\+521234000999/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/0 pts/i).length).toBeGreaterThan(0);
    });

    it("shows duplicate-phone error inline and keeps the modal open", async () => {
      const user = userEvent.setup();
      const createCustomerAction = vi.fn(
        async (): Promise<PosCreateCustomerActionState> => ({
          status: "error",
          message: "Ya existe un cliente con ese telefono en este negocio.",
          fieldErrors: {
            phone: "Ya existe un cliente con ese telefono en este negocio.",
          },
        }),
      );

      render(
        <PosPurchaseForm
          initialCustomers={[CUSTOMER]}
          action={idleAction()}
          createCustomerAction={createCustomerAction}
        />,
      );

      await user.type(screen.getByRole("searchbox"), "Cliente Duplicado");
      await user.click(
        await screen.findByRole("button", { name: /crear cliente nuevo/i }),
      );

      await user.type(screen.getByLabelText("Telefono"), "+521111111111");
      await user.click(
        screen.getByRole("button", { name: /guardar y seleccionar/i }),
      );

      expect(
        await screen.findAllByText(
          /ya existe un cliente con ese telefono en este negocio/i,
        ),
      ).not.toHaveLength(0);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("searchbox")).toHaveValue("Cliente Duplicado");
    });
  });
});
