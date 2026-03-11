import { render, screen } from "@testing-library/react";
import { RewardProgressCard } from "@/components/rewards/reward-progress-card";
import type { RewardRule } from "@/lib/rewards/types";

const ACTIVE_REWARD_RULES: RewardRule[] = [
  {
    id: "rule-1",
    business_id: "biz-1",
    name: "Free coffee",
    points_required: 100,
    reward_description: "Any medium coffee for free.",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "rule-2",
    business_id: "biz-1",
    name: "20% off order",
    points_required: 200,
    reward_description: "20% discount on the next order.",
    is_active: true,
    created_at: "2024-01-02T00:00:00Z",
  },
];

function renderCard(
  currentPoints: number,
  rewardRules: RewardRule[] = ACTIVE_REWARD_RULES,
) {
  render(
    <RewardProgressCard
      customer={{
        customer_id: "cust-1",
        customer_name: "Alex Johnson",
        current_points: currentPoints,
      }}
      rewardRules={rewardRules}
    />,
  );
}

describe("RewardProgressCard integration", () => {
  it("renders in_progress state with remaining points", () => {
    renderCard(60);

    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/current progress/i)).toBeInTheDocument();
    expect(screen.getByText("Free coffee")).toBeInTheDocument();
    expect(screen.getByText(/40 points to next reward/i)).toBeInTheDocument();
  });

  it("renders redeemable state with next reward goal", () => {
    renderCard(120);

    expect(screen.getAllByText(/reward available/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/next goal/i)).toBeInTheDocument();
    expect(screen.getByText("Free coffee")).toBeInTheDocument();
    expect(screen.getByText("20% off order")).toBeInTheDocument();
    expect(screen.getByText(/80 points to next reward/i)).toBeInTheDocument();
  });

  it("renders redeemable state without next reward as highest reached", () => {
    renderCard(250);

    expect(screen.getAllByText(/reward available/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/highest reward reached\./i)).toBeInTheDocument();
    expect(screen.queryByText(/next goal/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/points to next reward/i),
    ).not.toBeInTheDocument();
  });

  it("renders no_reward state when no active reward rules exist", () => {
    renderCard(
      20,
      ACTIVE_REWARD_RULES.map((rule) => ({ ...rule, is_active: false })),
    );

    expect(screen.getByText(/^no reward$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/no rewards available yet for this customer\./i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/reward available/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/next goal/i)).not.toBeInTheDocument();
  });
});
