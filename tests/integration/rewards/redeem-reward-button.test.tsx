import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import {
  RedeemRewardButton,
  type RedeemRewardResult,
} from "@/components/rewards/redeem-reward-button";

function makeAction(result: RedeemRewardResult) {
  return vi.fn(async () => result);
}

describe("RedeemRewardButton integration", () => {
  describe("Button visibility", () => {
    it("should display the canjear recompensa button", () => {
      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={120}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={makeAction({ success: true, error: null, message: null })}
        />,
      );

      expect(
        screen.getByRole("button", { name: /canjear recompensa/i }),
      ).toBeInTheDocument();
    });

    it("should display button even when customer has insufficient points", () => {
      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={50}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={makeAction({ success: true, error: null, message: null })}
        />,
      );

      const redeemButton = screen.getByRole("button", {
        name: /canjear recompensa/i,
      });
      expect(redeemButton).toBeInTheDocument();
      expect(redeemButton).toBeEnabled();
    });

    it("should display button when customer has exactly the required points", () => {
      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={100}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={makeAction({ success: true, error: null, message: null })}
        />,
      );

      const redeemButton = screen.getByRole("button", {
        name: /canjear recompensa/i,
      });
      expect(redeemButton).toBeInTheDocument();
      expect(redeemButton).toBeEnabled();
    });
  });

  describe("Confirmation dialog", () => {
    it("should open confirmation dialog when button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={120}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={makeAction({ success: true, error: null, message: null })}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));

      expect(
        screen.getByRole("dialog", { name: /confirmar canje de recompensa/i }),
      ).toBeInTheDocument();
    });

    it("should display all required information in the confirmation dialog", async () => {
      const user = userEvent.setup();

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={120}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={makeAction({ success: true, error: null, message: null })}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));

      // Verify reward name
      expect(screen.getByText("Cafe gratis")).toBeInTheDocument();

      // Verify points required (appears in dialog)
      expect(screen.getByText("100")).toBeInTheDocument();
      // Verify current points
      expect(screen.getByText("120")).toBeInTheDocument();
      // Verify points after redemption
      expect(screen.getByText("20")).toBeInTheDocument();
    });

    it("should disable confirm button when customer has insufficient points", async () => {
      const user = userEvent.setup();

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={50}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={makeAction({ success: true, error: null, message: null })}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));

      const confirmButton = screen.getByRole("button", {
        name: /confirmar canje/i,
      });
      expect(confirmButton).toBeDisabled();
    });

    it("should calculate and display correct points after redemption", async () => {
      const user = userEvent.setup();

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Juan Perez"
          currentPoints={250}
          rewardRuleId="reward-2"
          rewardName="Postre especial"
          pointsRequired={150}
          action={makeAction({ success: true, error: null, message: null })}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));

      // Points after redemption should be 250 - 150 = 100
      expect(screen.getByText("100")).toBeInTheDocument();
    });
  });

  describe("confirmar canje", () => {
    it("should call the redemption action when confirm button is clicked", async () => {
      const user = userEvent.setup();
      const action = makeAction({
        success: true,
        error: null,
        message: "Recompensa canjeada.",
      });

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={120}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={action}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));
      await user.click(
        screen.getByRole("button", { name: /confirmar canje/i }),
      );

      await waitFor(() => {
        expect(action).toHaveBeenCalledTimes(1);
      });
    });

    it("should close dialog and show success message after successful redemption", async () => {
      const user = userEvent.setup();
      const action = makeAction({
        success: true,
        error: null,
        message: "Recompensa canjeada.",
      });

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={120}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={action}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));
      await user.click(
        screen.getByRole("button", { name: /confirmar canje/i }),
      );

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });

      // Success message should be displayed
      expect(
        await screen.findByText("Recompensa canjeada."),
      ).toBeInTheDocument();
    });

    it("should display success message with correct styling", async () => {
      const user = userEvent.setup();
      const successMessage = "¡Recompensa canjeada exitosamente!";
      const action = makeAction({
        success: true,
        error: null,
        message: successMessage,
      });

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={120}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={action}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));
      await user.click(
        screen.getByRole("button", { name: /confirmar canje/i }),
      );

      const successElement = await screen.findByText(successMessage);
      expect(successElement).toBeInTheDocument();
      expect(successElement).toHaveClass("text-emerald-700");
    });

    it("should pass correct form data to action", async () => {
      const user = userEvent.setup();
      const action = vi.fn(async (_previousState, formData: FormData) => ({
        success: true,
        error: null,
        message: "Success",
      }));

      render(
        <RedeemRewardButton
          customerId="customer-123"
          customerName="Ana Garcia"
          currentPoints={120}
          rewardRuleId="reward-456"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={action}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));
      await user.click(
        screen.getByRole("button", { name: /confirmar canje/i }),
      );

      await waitFor(() => {
        expect(action).toHaveBeenCalledTimes(1);
        const call = action.mock.calls[0];
        const formData = call[1] as FormData;
        expect(formData.get("customer_id")).toBe("customer-123");
        expect(formData.get("reward_rule_id")).toBe("reward-456");
      });
    });
  });

  describe("Cancel redemption", () => {
    it("should close dialog when cancel button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={120}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={makeAction({ success: true, error: null, message: null })}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));

      expect(
        screen.getByRole("dialog", { name: /confirmar canje de recompensa/i }),
      ).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /cancelar/i }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should not call action when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const action = makeAction({
        success: true,
        error: null,
        message: "Recompensa canjeada.",
      });

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={120}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={action}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));
      await user.click(screen.getByRole("button", { name: /cancelar/i }));

      expect(action).not.toHaveBeenCalled();
    });

    it("should allow reopening dialog after cancellation", async () => {
      const user = userEvent.setup();

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={120}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={makeAction({ success: true, error: null, message: null })}
        />,
      );

      // Open dialog
      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));
      expect(
        screen.getByRole("dialog", { name: /confirmar canje de recompensa/i }),
      ).toBeInTheDocument();

      // Cancel
      await user.click(screen.getByRole("button", { name: /cancelar/i }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      // Reopen dialog
      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));
      expect(
        screen.getByRole("dialog", { name: /confirmar canje de recompensa/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    it("should display error message when redemption fails", async () => {
      const user = userEvent.setup();
      const errorMessage = "Hubo un error al canjear la recompensa.";
      const action = vi.fn(async () => ({
        success: false,
        error: errorMessage,
        message: null,
      }));

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={120}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={action}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));
      await user.click(
        screen.getByRole("button", { name: /confirmar canje/i }),
      );

      expect(await screen.findByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toHaveClass("text-rose-700");
    });

    it("should keep dialog open when error occurs", async () => {
      const user = userEvent.setup();
      const action = vi.fn(async () => ({
        success: false,
        error: "Error occurred",
        message: null,
      }));

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={120}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={action}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));
      await user.click(
        screen.getByRole("button", { name: /confirmar canje/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should display error inside the dialog", async () => {
      const user = userEvent.setup();
      const errorMessage = "Puntos insuficientes.";
      const action = vi.fn(async () => ({
        success: false,
        error: errorMessage,
        message: null,
      }));

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={120}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={action}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));
      await user.click(
        screen.getByRole("button", { name: /confirmar canje/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole("dialog", { name: /confirmar canje de recompensa/i }),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole("dialog", { name: /confirmar canje de recompensa/i }),
      ).toHaveTextContent(errorMessage);
    });
  });

  describe("Loading state", () => {
    it("should disable buttons while action is pending", async () => {
      const user = userEvent.setup();
      let resolveAction: () => void;
      const actionPromise = new Promise<RedeemRewardResult>((resolve) => {
        resolveAction = () =>
          resolve({ success: true, error: null, message: "Success" });
      });

      const action = vi.fn(async () => actionPromise);

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={120}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={action}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));
      await user.click(
        screen.getByRole("button", { name: /confirmar canje/i }),
      );

      const confirmButton = screen.getByRole("button", {
        name: /confirmar canje|canjeando/i,
      });
      expect(confirmButton).toBeDisabled();

      const cancelButton = screen.getByRole("button", { name: /cancelar/i });
      expect(cancelButton).toBeDisabled();

      resolveAction!();
    });

    it("should show loading text on confirm button", async () => {
      const user = userEvent.setup();
      let resolveAction: () => void;
      const actionPromise = new Promise<RedeemRewardResult>((resolve) => {
        resolveAction = () =>
          resolve({ success: true, error: null, message: "Success" });
      });

      const action = vi.fn(async () => actionPromise);

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={120}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={action}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));
      await user.click(
        screen.getByRole("button", { name: /confirmar canje/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /canjeando/i }),
        ).toBeInTheDocument();
      });

      resolveAction!();
    });
  });

  describe("Edge cases", () => {
    it("should handle zero current points", async () => {
      const user = userEvent.setup();

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={0}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={makeAction({ success: true, error: null, message: null })}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));

      // Verify 0 points are displayed
      expect(screen.getAllByText("0")).toHaveLength(2); // Current points and after redemption
      expect(
        screen.getByRole("button", { name: /confirmar canje/i }),
      ).toBeDisabled();
    });

    it("should handle high point values", async () => {
      const user = userEvent.setup();

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={10000}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={makeAction({ success: true, error: null, message: null })}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));

      expect(screen.getByText("10000")).toBeInTheDocument();
      expect(screen.getByText("9900")).toBeInTheDocument(); // Points after redemption
    });

    it("should handle long reward names", async () => {
      const user = userEvent.setup();
      const longRewardName =
        "Desayuno completo con café premium y pan artesanal";

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName="Ana Garcia"
          currentPoints={200}
          rewardRuleId="reward-1"
          rewardName={longRewardName}
          pointsRequired={100}
          action={makeAction({ success: true, error: null, message: null })}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));

      expect(screen.getByText(longRewardName)).toBeInTheDocument();
    });

    it("should handle long customer names", async () => {
      const user = userEvent.setup();
      const longCustomerName = "María del Carmen González Rodríguez López";

      render(
        <RedeemRewardButton
          customerId="customer-1"
          customerName={longCustomerName}
          currentPoints={120}
          rewardRuleId="reward-1"
          rewardName="Cafe gratis"
          pointsRequired={100}
          action={makeAction({ success: true, error: null, message: null })}
        />,
      );

      await user.click(screen.getByRole("button", { name: /canjear recompensa/i }));

      // Verify long customer name is displayed in the dialog
      expect(
        screen.getByRole("dialog", { name: /confirmar canje de recompensa/i }),
      ).toHaveTextContent(longCustomerName);
    });
  });
});
