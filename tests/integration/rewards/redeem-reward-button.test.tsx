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
  it("shows Redeem reward button", () => {
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
      screen.getByRole("button", { name: /redeem reward/i }),
    ).toBeInTheDocument();
  });

  it("opens confirmation dialog and renders redemption details", async () => {
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

    await user.click(screen.getByRole("button", { name: /redeem reward/i }));

    expect(
      screen.getByRole("dialog", { name: /confirm reward redemption/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cafe gratis")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("submits confirm action and shows success message", async () => {
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

    await user.click(screen.getByRole("button", { name: /redeem reward/i }));
    await user.click(
      screen.getByRole("button", { name: /confirm redemption/i }),
    );

    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText("Recompensa canjeada.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
