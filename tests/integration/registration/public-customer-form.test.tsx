import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { PublicRegistrationForm } from "@/components/registration/public-registration-form";
import { createCustomerSchema } from "@/lib/customers/schema";
import {
  PublicRegistrationResult,
  initialPublicRegistrationResult,
} from "@/app/r/[slug]/types";

const BUSINESS_NAME = "Cafetería El Roble";

function makeIdleAction() {
  return vi.fn(
    async (): Promise<PublicRegistrationResult> =>
      initialPublicRegistrationResult,
  );
}

/**
 * An action that runs the real schema validation so the form receives
 * genuine field-level error feedback, matching the server-action behaviour.
 */
function makeValidationAwareAction() {
  return vi.fn(
    async (
      _prev: PublicRegistrationResult,
      formData: FormData,
    ): Promise<PublicRegistrationResult> => {
      const parsed = createCustomerSchema.safeParse({
        name: String(formData.get("name") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        birthday: String(formData.get("birthday") ?? ""),
        consent_marketing: formData.get("consent_marketing") === "on",
      });

      if (!parsed.success) {
        return {
          success: false,
          error: "Revisa los datos del formulario.",
          message: null,
        };
      }

      return {
        success: true,
        error: null,
        message: "¡Registro exitoso! Bienvenido al programa de lealtad.",
      };
    },
  );
}

describe("PublicRegistrationForm integration", () => {
  it("renders all expected fields and the submit button", () => {
    render(
      <PublicRegistrationForm
        businessName={BUSINESS_NAME}
        action={makeIdleAction()}
      />,
    );

    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de cumpleaños/i)).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /acepto recibir/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /unirme al programa/i }),
    ).toBeInTheDocument();
  });

  it("displays the business name in the consent label", () => {
    render(
      <PublicRegistrationForm
        businessName={BUSINESS_NAME}
        action={makeIdleAction()}
      />,
    );

    expect(screen.getByText(new RegExp(BUSINESS_NAME))).toBeInTheDocument();
  });

  it("shows a generic error message on invalid submit", async () => {
    const user = userEvent.setup();
    const action = makeValidationAwareAction();

    render(
      <PublicRegistrationForm businessName={BUSINESS_NAME} action={action} />,
    );

    // Submit with all fields empty to trigger validation failure.
    await user.click(
      screen.getByRole("button", { name: /unirme al programa/i }),
    );

    expect(
      await screen.findByText("Revisa los datos del formulario."),
    ).toBeInTheDocument();
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("shows error when only phone is missing", async () => {
    const user = userEvent.setup();
    const action = makeValidationAwareAction();

    render(
      <PublicRegistrationForm businessName={BUSINESS_NAME} action={action} />,
    );

    await user.type(screen.getByLabelText(/nombre completo/i), "Ana López");
    // phone intentionally left blank
    await user.click(
      screen.getByRole("button", { name: /unirme al programa/i }),
    );

    expect(
      await screen.findByText("Revisa los datos del formulario."),
    ).toBeInTheDocument();
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("shows error when email format is invalid", async () => {
    const user = userEvent.setup();
    const action = makeValidationAwareAction();

    render(
      <PublicRegistrationForm businessName={BUSINESS_NAME} action={action} />,
    );

    await user.type(screen.getByLabelText(/nombre completo/i), "Ana López");
    await user.type(screen.getByLabelText(/teléfono/i), "+521234567890");
    await user.type(
      screen.getByLabelText(/correo electrónico/i),
      "no-es-correo",
    );

    await user.click(
      screen.getByRole("button", { name: /unirme al programa/i }),
    );

    expect(
      await screen.findByText("Revisa los datos del formulario."),
    ).toBeInTheDocument();
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("calls the submit handler with form data on valid submit", async () => {
    const user = userEvent.setup();
    const action = makeValidationAwareAction();

    render(
      <PublicRegistrationForm businessName={BUSINESS_NAME} action={action} />,
    );

    await user.type(screen.getByLabelText(/nombre completo/i), "Ana López");
    await user.type(screen.getByLabelText(/teléfono/i), "+521234567890");
    await user.type(
      screen.getByLabelText(/correo electrónico/i),
      "ana@example.com",
    );
    await user.type(
      screen.getByLabelText(/fecha de cumpleaños/i),
      "2000-01-01",
    );

    await user.click(
      screen.getByRole("button", { name: /unirme al programa/i }),
    );

    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });

    // Verify the FormData passed to the action contains the expected values.
    const [, formData] = action.mock.calls[0];
    expect(formData.get("name")).toBe("Ana López");
    expect(formData.get("phone")).toBe("+521234567890");
    expect(formData.get("email")).toBe("ana@example.com");
    expect(formData.get("birthday")).toBe("2000-01-01");
  });

  it("renders success message after successful submission", async () => {
    const user = userEvent.setup();
    const action = makeValidationAwareAction();

    render(
      <PublicRegistrationForm businessName={BUSINESS_NAME} action={action} />,
    );

    await user.type(screen.getByLabelText(/nombre completo/i), "Ana López");
    await user.type(screen.getByLabelText(/teléfono/i), "+521234567890");

    await user.click(
      screen.getByRole("button", { name: /unirme al programa/i }),
    );

    expect(
      await screen.findByRole("heading", { name: /te registraste con éxito/i }),
    ).toBeInTheDocument();
    // The form fields should no longer be visible.
    expect(
      screen.queryByRole("button", { name: /unirme al programa/i }),
    ).not.toBeInTheDocument();
  });

  it("displays the business name in the success message", async () => {
    const user = userEvent.setup();
    const action = makeValidationAwareAction();

    render(
      <PublicRegistrationForm businessName={BUSINESS_NAME} action={action} />,
    );

    await user.type(screen.getByLabelText(/nombre completo/i), "Ana López");
    await user.type(screen.getByLabelText(/teléfono/i), "+521234567890");

    await user.click(
      screen.getByRole("button", { name: /unirme al programa/i }),
    );

    await screen.findByRole("heading", { name: /te registraste con éxito/i });
    expect(screen.getByText(new RegExp(BUSINESS_NAME))).toBeInTheDocument();
  });

  it("consent checkbox is unchecked by default and can be toggled", async () => {
    const user = userEvent.setup();

    render(
      <PublicRegistrationForm
        businessName={BUSINESS_NAME}
        action={makeIdleAction()}
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: /acepto recibir/i });

    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("checked consent is forwarded in FormData when form is submitted", async () => {
    const user = userEvent.setup();
    const action = makeValidationAwareAction();

    render(
      <PublicRegistrationForm businessName={BUSINESS_NAME} action={action} />,
    );

    await user.type(screen.getByLabelText(/nombre completo/i), "Ana López");
    await user.type(screen.getByLabelText(/teléfono/i), "+521234567890");
    await user.click(screen.getByRole("checkbox", { name: /acepto recibir/i }));

    await user.click(
      screen.getByRole("button", { name: /unirme al programa/i }),
    );

    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });

    const [, formData] = action.mock.calls[0];
    expect(formData.get("consent_marketing")).toBe("on");
  });
});
