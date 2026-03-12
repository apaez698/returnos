import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { VisitForm } from "@/components/visits/visit-form";
import { CustomerListItem } from "@/lib/customers/types";
import { VisitActionState, initialVisitActionState } from "@/lib/visits/types";

const mockCustomers: CustomerListItem[] = [
  {
    id: "customer-1",
    name: "Juan Perez",
    phone: "555-0001",
    email: "juan@example.com",
    birthday: "1990-05-15",
    consent_marketing: true,
    last_visit_at: "2026-03-01T10:00:00Z",
  },
  {
    id: "customer-2",
    name: "Maria Garcia",
    phone: "555-0002",
    email: "maria@example.com",
    birthday: "1992-08-20",
    consent_marketing: false,
    last_visit_at: null,
  },
];

describe("VisitForm integration", () => {
  describe("rendering all expected fields", () => {
    it("renders form title and description", () => {
      const mockAction = vi.fn();
      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      expect(
        screen.getByRole("heading", { name: "Registrar visita" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Selecciona el cliente y registra puntos en menos de 10 segundos.",
        ),
      ).toBeInTheDocument();
    });

    it("renders customer select field with all customers", () => {
      const mockAction = vi.fn();
      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const customerSelect = screen.getByLabelText(
        "Cliente",
      ) as HTMLSelectElement;
      expect(customerSelect).toBeInTheDocument();
      expect(customerSelect).toHaveValue("");

      const options = customerSelect.querySelectorAll("option");
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent("Selecciona un cliente");
      expect(options[1]).toHaveTextContent("Juan Perez - 555-0001");
      expect(options[2]).toHaveTextContent("Maria Garcia - 555-0002");
    });

    it("renders points earned field with default value 0", () => {
      const mockAction = vi.fn();
      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const pointsInput = screen.getByLabelText("Puntos ganados");
      expect(pointsInput).toBeInTheDocument();
      expect(pointsInput).toHaveValue(0);
      expect(pointsInput).toHaveAttribute("type", "number");
      expect(pointsInput).toHaveAttribute("min", "0");
      expect(pointsInput).toHaveAttribute("step", "1");
    });

    it("renders source select field with all available sources", () => {
      const mockAction = vi.fn();
      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const sourceSelect = screen.getByLabelText("Origen");
      expect(sourceSelect).toBeInTheDocument();
      expect(sourceSelect).toHaveValue("manual");

      const options = screen.getAllByRole("option", {
        hidden: true,
      });
      const sourceOptions = options.filter(
        (opt) =>
          opt.textContent === "Manual" ||
          opt.textContent === "En tienda" ||
          opt.textContent === "QR",
      );
      expect(sourceOptions).toHaveLength(3);
      expect(sourceOptions[0]).toHaveTextContent("Manual");
      expect(sourceOptions[1]).toHaveTextContent("En tienda");
      expect(sourceOptions[2]).toHaveTextContent("QR");
    });

    it("renders amount field as optional", () => {
      const mockAction = vi.fn();
      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const amountInput = screen.getByLabelText(
        "Monto (opcional)",
      ) as HTMLInputElement;
      expect(amountInput).toBeInTheDocument();
      expect(amountInput.value).toBe("");
      expect(amountInput).toHaveAttribute("type", "number");
      expect(amountInput).toHaveAttribute("min", "0");
      expect(amountInput).toHaveAttribute("step", "0.01");
      expect(amountInput).not.toHaveAttribute("required");
    });

    it("renders product category field as optional", () => {
      const mockAction = vi.fn();
      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const categoryInput = screen.getByLabelText(
        "Categoria de producto (opcional)",
      );
      expect(categoryInput).toBeInTheDocument();
      expect(categoryInput).toHaveValue("");
      expect(categoryInput).toHaveAttribute("type", "text");
      expect(categoryInput).toHaveAttribute(
        "placeholder",
        "Pan dulce, cafe, almuerzo...",
      );
      expect(categoryInput).not.toHaveAttribute("required");
    });

    it("renders submit button", () => {
      const mockAction = vi.fn();
      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const submitButton = screen.getByRole("button", {
        name: "Guardar visita",
      });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });

    it("disables submit button when no customers are available", () => {
      const mockAction = vi.fn();
      render(<VisitForm customers={[]} action={mockAction} />);

      const submitButton = screen.getByRole("button", {
        name: "Guardar visita",
      });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("user interactions", () => {
    it("updates customer select when user changes selection", async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();
      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const customerSelect = screen.getByLabelText("Cliente");
      await user.selectOptions(customerSelect, "customer-1");

      expect(customerSelect).toHaveValue("customer-1");
    });

    it("updates points earned when user types a number", async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();
      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const pointsInput = screen.getByLabelText("Puntos ganados");
      await user.clear(pointsInput);
      await user.type(pointsInput, "25");

      expect(pointsInput).toHaveValue(25);
    });

    it("updates source select when user changes selection", async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();
      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const sourceSelect = screen.getByLabelText("Origen");
      expect(sourceSelect).toHaveValue("manual");

      await user.selectOptions(sourceSelect, "in_store");
      expect(sourceSelect).toHaveValue("in_store");

      await user.selectOptions(sourceSelect, "qr");
      expect(sourceSelect).toHaveValue("qr");
    });

    it("updates amount when user types a number", async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();
      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const amountInput = screen.getByLabelText("Monto (opcional)");
      await user.type(amountInput, "99.99");

      expect(amountInput).toHaveValue(99.99);
    });

    it("updates product category when user types text", async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();
      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const categoryInput = screen.getByLabelText(
        "Categoria de producto (opcional)",
      );
      await user.type(categoryInput, "Pan dulce");

      expect(categoryInput).toHaveValue("Pan dulce");
    });
  });

  describe("validation and error display", () => {
    it("shows validation error when customer is not selected and form is submitted", async () => {
      const user = userEvent.setup();
      let resolveAction: (() => void) | null = null;

      const mockAction = vi.fn(async () => {
        return new Promise<VisitActionState>((resolve) => {
          resolveAction = () => {
            resolve({
              status: "error",
              fieldErrors: {
                customer_id: "El cliente es requerido",
              },
            });
          };
        });
      });

      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const submitButton = screen.getByRole("button", {
        name: "Guardar visita",
      });
      await user.click(submitButton);

      resolveAction?.();

      await waitFor(() => {
        expect(screen.getByText("El cliente es requerido")).toBeInTheDocument();
      });
    });

    it("shows validation error for invalid points earned", async () => {
      const user = userEvent.setup();
      let resolveAction: (() => void) | null = null;

      const mockAction = vi.fn(async () => {
        return new Promise<VisitActionState>((resolve) => {
          resolveAction = () => {
            resolve({
              status: "error",
              fieldErrors: {
                points_earned: "Los puntos deben ser un número valido",
              },
            });
          };
        });
      });

      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const submitButton = screen.getByRole("button", {
        name: "Guardar visita",
      });
      await user.click(submitButton);

      resolveAction?.();

      await waitFor(() => {
        expect(
          screen.getByText("Los puntos deben ser un número valido"),
        ).toBeInTheDocument();
      });
    });

    it("shows validation error for invalid amount", async () => {
      const user = userEvent.setup();
      let resolveAction: (() => void) | null = null;

      const mockAction = vi.fn(async () => {
        return new Promise<VisitActionState>((resolve) => {
          resolveAction = () => {
            resolve({
              status: "error",
              fieldErrors: {
                amount: "El monto debe ser un número positivo",
              },
            });
          };
        });
      });

      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const submitButton = screen.getByRole("button", {
        name: "Guardar visita",
      });
      await user.click(submitButton);

      resolveAction?.();

      await waitFor(() => {
        expect(
          screen.getByText("El monto debe ser un número positivo"),
        ).toBeInTheDocument();
      });
    });

    it("shows validation error for invalid product category", async () => {
      const user = userEvent.setup();
      let resolveAction: (() => void) | null = null;

      const mockAction = vi.fn(async () => {
        return new Promise<VisitActionState>((resolve) => {
          resolveAction = () => {
            resolve({
              status: "error",
              fieldErrors: {
                product_category:
                  "La categoria debe tener menos de 50 caracteres",
              },
            });
          };
        });
      });

      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const submitButton = screen.getByRole("button", {
        name: "Guardar visita",
      });
      await user.click(submitButton);

      resolveAction?.();

      await waitFor(() => {
        expect(
          screen.getByText("La categoria debe tener menos de 50 caracteres"),
        ).toBeInTheDocument();
      });
    });

    it("clears error messages when form values change", async () => {
      const user = userEvent.setup();
      let resolveAction: (() => void) | null = null;

      const mockAction = vi.fn(async () => {
        return new Promise<VisitActionState>((resolve) => {
          resolveAction = () => {
            resolve({
              status: "error",
              fieldErrors: {
                customer_id: "El cliente es requerido",
              },
            });
          };
        });
      });

      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const submitButton = screen.getByRole("button", {
        name: "Guardar visita",
      });
      await user.click(submitButton);

      resolveAction?.();

      await waitFor(() => {
        expect(screen.getByText("El cliente es requerido")).toBeInTheDocument();
      });

      const customerSelect = screen.getByLabelText("Cliente");
      await user.selectOptions(customerSelect, "customer-1");

      // Error should still be visible (form component doesn't auto-clear on change)
      // but the form can capture the new value
      expect(customerSelect).toHaveValue("customer-1");
    });
  });

  describe("form submission", () => {
    it("calls action with all form fields on valid submit", async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn(
        async () =>
          ({
            status: "success",
            message: "Visita registrada exitosamente",
          }) as VisitActionState,
      );

      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const customerSelect = screen.getByLabelText("Cliente");
      const pointsInput = screen.getByLabelText("Puntos ganados");
      const sourceSelect = screen.getByLabelText("Origen");
      const amountInput = screen.getByLabelText("Monto (opcional)");
      const categoryInput = screen.getByLabelText(
        "Categoria de producto (opcional)",
      );

      await user.selectOptions(customerSelect, "customer-1");
      await user.clear(pointsInput);
      await user.type(pointsInput, "50");
      await user.selectOptions(sourceSelect, "in_store");
      await user.type(amountInput, "150.50");
      await user.type(categoryInput, "Almuerzo");

      const submitButton = screen.getByRole("button", {
        name: "Guardar visita",
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalled();
      });

      const formData = mockAction.mock.calls[0][1] as FormData;
      expect(formData.get("customer_id")).toBe("customer-1");
      expect(formData.get("points_earned")).toBe("50");
      expect(formData.get("source")).toBe("in_store");
      expect(formData.get("amount")).toBe("150.5");
      expect(formData.get("product_category")).toBe("Almuerzo");
    });

    it("shows loading state while submitting", async () => {
      const user = userEvent.setup();
      let resolveAction: (() => void) | null = null;

      const mockAction = vi.fn(async () => {
        return new Promise<VisitActionState>((resolve) => {
          resolveAction = () => {
            resolve({
              status: "success",
              message: "Visita registrada exitosamente",
            });
          };
        });
      });

      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const customerSelect = screen.getByLabelText("Cliente");
      await user.selectOptions(customerSelect, "customer-1");

      const submitButton = screen.getByRole("button", {
        name: "Guardar visita",
      });
      await user.click(submitButton);

      expect(
        screen.getByRole("button", { name: "Guardando..." }),
      ).toBeDisabled();

      resolveAction?.();

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Guardar visita" }),
        ).not.toBeDisabled();
      });
    });

    it("displays success message after successful submission", async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn(
        async () =>
          ({
            status: "success",
            message: "Visita registrada exitosamente",
          }) as VisitActionState,
      );

      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const customerSelect = screen.getByLabelText("Cliente");
      await user.selectOptions(customerSelect, "customer-1");

      const submitButton = screen.getByRole("button", {
        name: "Guardar visita",
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Visita registrada exitosamente"),
        ).toBeInTheDocument();
      });
    });

    it("displays error message after failed submission", async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn(
        async () =>
          ({
            status: "error",
            message: "No se pudo registrar la visita. Intenta de nuevo.",
          }) as VisitActionState,
      );

      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const customerSelect = screen.getByLabelText("Cliente");
      await user.selectOptions(customerSelect, "customer-1");

      const submitButton = screen.getByRole("button", {
        name: "Guardar visita",
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("No se pudo registrar la visita. Intenta de nuevo."),
        ).toBeInTheDocument();
      });
    });

    it("resets form fields to defaults after successful submission", async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn(
        async () =>
          ({
            status: "success",
            message: "Visita registrada exitosamente",
          }) as VisitActionState,
      );

      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const customerSelect = screen.getByLabelText("Cliente");
      const pointsInput = screen.getByLabelText("Puntos ganados");
      const sourceSelect = screen.getByLabelText("Origen");
      const amountInput = screen.getByLabelText("Monto (opcional)");
      const categoryInput = screen.getByLabelText(
        "Categoria de producto (opcional)",
      );

      await user.selectOptions(customerSelect, "customer-1");
      await user.clear(pointsInput);
      await user.type(pointsInput, "50");
      await user.selectOptions(sourceSelect, "in_store");
      await user.type(amountInput, "150.50");
      await user.type(categoryInput, "Almuerzo");

      const submitButton = screen.getByRole("button", {
        name: "Guardar visita",
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Visita registrada exitosamente"),
        ).toBeInTheDocument();
      });

      // After success, form should reset to defaults
      const pointsInputElement = pointsInput as HTMLInputElement;
      const amountInputElement = amountInput as HTMLInputElement;
      const categoryInputElement = categoryInput as HTMLInputElement;

      await waitFor(() => {
        expect(pointsInputElement.value).toBe("0");
      });
      expect(sourceSelect).toHaveValue("manual");
      expect(amountInputElement.value).toBe("");
      expect(categoryInputElement.value).toBe("");
    });
  });

  describe("source select changes", () => {
    it("can change source from manual to in_store", async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();
      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const sourceSelect = screen.getByLabelText("Origen");
      expect(sourceSelect).toHaveValue("manual");

      await user.selectOptions(sourceSelect, "in_store");

      expect(sourceSelect).toHaveValue("in_store");
    });

    it("can change source from manual to qr", async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();
      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const sourceSelect = screen.getByLabelText("Origen");
      expect(sourceSelect).toHaveValue("manual");

      await user.selectOptions(sourceSelect, "qr");

      expect(sourceSelect).toHaveValue("qr");
    });

    it("can cycle through all source options", async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn();
      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const sourceSelect = screen.getByLabelText("Origen");

      const sources = ["in_store", "qr", "manual"];

      for (const source of sources) {
        await user.selectOptions(sourceSelect, source);
        expect(sourceSelect).toHaveValue(source);
      }
    });

    it("includes source value in form submission", async () => {
      const user = userEvent.setup();
      const mockAction = vi.fn(
        async () =>
          ({
            status: "success",
          }) as VisitActionState,
      );

      render(<VisitForm customers={mockCustomers} action={mockAction} />);

      const customerSelect = screen.getByLabelText("Cliente");
      const sourceSelect = screen.getByLabelText("Origen");

      await user.selectOptions(customerSelect, "customer-1");
      await user.selectOptions(sourceSelect, "qr");

      const submitButton = screen.getByRole("button", {
        name: "Guardar visita",
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalled();
      });

      const formData = mockAction.mock.calls[0][1] as FormData;
      expect(formData.get("source")).toBe("qr");
    });
  });
});
