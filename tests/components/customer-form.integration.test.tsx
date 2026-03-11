import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { CustomerForm } from "@/components/customers/customer-form";
import { createCustomerSchema } from "@/lib/customers/schema";
import {
  CustomerActionState,
  initialCustomerActionState,
} from "@/lib/customers/types";

function getFieldError(
  fieldErrors: Record<string, string[] | undefined>,
  field: string,
): string | undefined {
  return fieldErrors[field]?.[0];
}

function createValidationAwareAction() {
  return vi.fn(
    async (
      _previousState: CustomerActionState,
      formData: FormData,
    ): Promise<CustomerActionState> => {
      const parsed = createCustomerSchema.safeParse({
        name: String(formData.get("name") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        birthday: String(formData.get("birthday") ?? ""),
        consent_marketing: formData.get("consent_marketing") === "on",
      });

      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;

        return {
          status: "error",
          message: "Revisa los datos del formulario.",
          fieldErrors: {
            name: getFieldError(fieldErrors, "name"),
            phone: getFieldError(fieldErrors, "phone"),
            email: getFieldError(fieldErrors, "email"),
            birthday: getFieldError(fieldErrors, "birthday"),
          },
        };
      }

      return {
        status: "success",
        message: "Cliente creado correctamente.",
      };
    },
  );
}

describe("CustomerForm integration", () => {
  it("renders all expected form fields", () => {
    render(
      <CustomerForm action={vi.fn(async () => initialCustomerActionState)} />,
    );

    expect(
      screen.getByRole("heading", { name: "Agregar cliente" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Telefono")).toBeInTheDocument();
    expect(screen.getByLabelText("Correo (opcional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Cumpleanos (opcional)")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Acepta comunicaciones de marketing"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar cliente" }),
    ).toBeInTheDocument();
  });

  it("shows validation errors on invalid submit", async () => {
    const user = userEvent.setup();
    const action = createValidationAwareAction();

    render(<CustomerForm action={action} />);

    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(
      screen.getByLabelText("Correo (opcional)"),
      "correo-invalido",
    );

    await user.click(screen.getByRole("button", { name: "Guardar cliente" }));

    expect(
      await screen.findByText("El telefono es obligatorio."),
    ).toBeInTheDocument();
    expect(screen.getByText("Ingresa un correo valido.")).toBeInTheDocument();
    expect(
      screen.getByText("Revisa los datos del formulario."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Ana");
    expect(screen.getByLabelText("Correo (opcional)")).toHaveValue(
      "correo-invalido",
    );
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("calls submit handler on valid submit", async () => {
    const user = userEvent.setup();
    const submitHandler = vi.fn(async () => ({
      status: "success",
      message: "Cliente creado correctamente.",
    }));

    render(<CustomerForm action={submitHandler} />);

    await user.type(screen.getByLabelText("Nombre"), "Ana Lopez");
    await user.type(screen.getByLabelText("Telefono"), "+521234567890");
    await user.type(
      screen.getByLabelText("Correo (opcional)"),
      "ana@example.com",
    );
    await user.type(
      screen.getByLabelText("Cumpleanos (opcional)"),
      "2000-01-01",
    );
    await user.click(screen.getByRole("button", { name: "Guardar cliente" }));

    await waitFor(() => {
      expect(submitHandler).toHaveBeenCalledTimes(1);
    });
  });

  it("allows toggling consent_marketing checkbox", async () => {
    const user = userEvent.setup();

    render(
      <CustomerForm action={vi.fn(async () => initialCustomerActionState)} />,
    );

    const consentCheckbox = screen.getByLabelText(
      "Acepta comunicaciones de marketing",
    );

    expect(consentCheckbox).not.toBeChecked();

    await user.click(consentCheckbox);
    expect(consentCheckbox).toBeChecked();

    await user.click(consentCheckbox);
    expect(consentCheckbox).not.toBeChecked();
  });
});
