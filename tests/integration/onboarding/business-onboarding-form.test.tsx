import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { BusinessOnboardingForm } from "@/features/onboarding/components/business-onboarding-form";
import { createBusinessOwnerInputSchema } from "@/lib/onboarding/onboarding-schema";
import type { OnboardingActionState } from "@/lib/onboarding/types";
import { initialOnboardingActionState } from "@/lib/onboarding/types";

function makeIdleAction() {
  return vi.fn(async (): Promise<OnboardingActionState> => {
    return initialOnboardingActionState;
  });
}

function makeValidationAwareAction() {
  return vi.fn(
    async (
      _previousState: OnboardingActionState,
      formData: FormData,
    ): Promise<OnboardingActionState> => {
      const payload = {
        businessName: String(formData.get("businessName") ?? ""),
        businessType: String(formData.get("businessType") ?? ""),
      };

      const parsed = createBusinessOwnerInputSchema.safeParse(payload);

      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;

        return {
          status: "error",
          message: "Revisa los datos de tu negocio.",
          fieldErrors: {
            businessName: fieldErrors.businessName?.[0],
            businessType: fieldErrors.businessType?.[0],
          },
        };
      }

      return initialOnboardingActionState;
    },
  );
}

describe("BusinessOnboardingForm integration", () => {
  it("renders expected fields and submit button", () => {
    render(<BusinessOnboardingForm action={makeIdleAction()} />);

    expect(screen.getByLabelText(/nombre de tu negocio/i)).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /panaderia \/ cafeteria/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /restaurante/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /crear negocio y continuar/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    const action = makeValidationAwareAction();

    render(<BusinessOnboardingForm action={action} />);

    await user.click(
      screen.getByRole("button", { name: /crear negocio y continuar/i }),
    );

    expect(
      await screen.findByText("Revisa los datos de tu negocio."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Escribe el nombre de tu negocio."),
    ).toBeInTheDocument();
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("submits valid data including selected business type", async () => {
    const user = userEvent.setup();
    const action = makeValidationAwareAction();

    render(<BusinessOnboardingForm action={action} />);

    await user.type(
      screen.getByLabelText(/nombre de tu negocio/i),
      "Cafeteria Aurora",
    );

    await user.click(screen.getByRole("radio", { name: /restaurante/i }));

    await user.click(
      screen.getByRole("button", { name: /crear negocio y continuar/i }),
    );

    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });

    const [, formData] = action.mock.calls[0];
    expect(formData.get("businessName")).toBe("Cafeteria Aurora");
    expect(formData.get("businessType")).toBe("restaurant");
  });

  it("has bakery selected by default and allows toggling to restaurant", async () => {
    const user = userEvent.setup();

    render(<BusinessOnboardingForm action={makeIdleAction()} />);

    const bakeryOption = screen.getByRole("radio", {
      name: /panaderia \/ cafeteria/i,
    });
    const restaurantOption = screen.getByRole("radio", {
      name: /restaurante/i,
    });

    expect(bakeryOption).toBeChecked();
    expect(restaurantOption).not.toBeChecked();

    await user.click(restaurantOption);

    expect(restaurantOption).toBeChecked();
    expect(bakeryOption).not.toBeChecked();
  });
});
