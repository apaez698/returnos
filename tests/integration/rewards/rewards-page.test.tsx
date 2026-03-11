import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import {
  getRewardRulesForCurrentBusiness,
  getCustomerRewardProgressList,
} from "@/lib/rewards/data";
import DashboardRewardsPage from "@/app/dashboard/rewards/page";
import type { RewardRule, CustomerRewardProgress } from "@/lib/rewards/types";

vi.mock("@/lib/rewards/data", () => ({
  getRewardRulesForCurrentBusiness: vi.fn(),
  getCustomerRewardProgressList: vi.fn(),
}));

vi.mock("@/app/dashboard/rewards/actions", () => ({
  createRewardRuleAction: vi.fn(),
  toggleRewardRuleAction: vi.fn(),
  deleteRewardRuleAction: vi.fn(),
}));

vi.mock("@/components/rewards/reward-form", () => ({
  RewardForm: () => <div data-testid="reward-form" />,
}));

vi.mock("@/components/rewards/reward-rules-table", () => ({
  RewardRulesTable: ({ rewards }: { rewards: RewardRule[] }) => (
    <ul data-testid="reward-rules-table">
      {rewards.map((r) => (
        <li key={r.id}>{r.name}</li>
      ))}
    </ul>
  ),
}));

vi.mock("@/components/rewards/reward-progress-card", () => ({
  RewardProgressCard: ({
    customer,
  }: {
    customer: Pick<
      CustomerRewardProgress,
      "customer_id" | "customer_name" | "current_points"
    >;
    rewardRules: RewardRule[];
  }) => <div data-testid="reward-progress-card">{customer.customer_name}</div>,
}));

const MOCK_REWARDS: RewardRule[] = [
  {
    id: "rule-1",
    business_id: "biz-1",
    name: "Café Gratis",
    points_required: 100,
    reward_description: "Un café gratis después de 10 visitas",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "rule-2",
    business_id: "biz-1",
    name: "Descuento 10%",
    points_required: 200,
    reward_description: "10% de descuento en su próxima compra",
    is_active: false,
    created_at: "2024-01-02T00:00:00Z",
  },
];

const MOCK_PROGRESS: CustomerRewardProgress[] = [
  {
    customer_id: "cust-1",
    customer_name: "Ana García",
    current_points: 75,
    nearest_reward: MOCK_REWARDS[0],
    progress_percentage: 75,
    remaining_points: 25,
    status: "in_progress",
  },
  {
    customer_id: "cust-2",
    customer_name: "Luis Pérez",
    current_points: 110,
    nearest_reward: MOCK_REWARDS[0],
    progress_percentage: 100,
    remaining_points: 0,
    status: "redeemable",
  },
];

async function renderPage() {
  const jsx = await DashboardRewardsPage();
  render(jsx);
}

describe("DashboardRewardsPage (/dashboard/rewards)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRewardRulesForCurrentBusiness).mockResolvedValue(MOCK_REWARDS);
    vi.mocked(getCustomerRewardProgressList).mockResolvedValue(MOCK_PROGRESS);
  });

  it("renders the page title", async () => {
    await renderPage();

    expect(
      screen.getByRole("heading", { name: "Recompensas", level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders the page description", async () => {
    await renderPage();

    expect(
      screen.getByText(/gestiona reglas de recompensas/i),
    ).toBeInTheDocument();
  });

  it("renders the reward form", async () => {
    await renderPage();

    expect(screen.getByTestId("reward-form")).toBeInTheDocument();
  });

  it("renders the reward rules section heading", async () => {
    await renderPage();

    expect(
      screen.getByRole("heading", { name: /reglas de recompensa/i, level: 2 }),
    ).toBeInTheDocument();
  });

  it("renders the reward rules table with fetched rules", async () => {
    await renderPage();

    expect(screen.getByTestId("reward-rules-table")).toBeInTheDocument();
    expect(screen.getByText("Café Gratis")).toBeInTheDocument();
    expect(screen.getByText("Descuento 10%")).toBeInTheDocument();
  });

  it("renders the customer progress section when active rewards exist", async () => {
    await renderPage();

    expect(
      screen.getByRole("heading", { name: /progreso de clientes/i, level: 2 }),
    ).toBeInTheDocument();
  });

  it("renders a progress card for each customer", async () => {
    await renderPage();

    const cards = screen.getAllByTestId("reward-progress-card");
    expect(cards).toHaveLength(2);
    expect(screen.getByText("Ana García")).toBeInTheDocument();
    expect(screen.getByText("Luis Pérez")).toBeInTheDocument();
  });

  it("shows no-active-rewards notice when all reward rules are inactive", async () => {
    vi.mocked(getRewardRulesForCurrentBusiness).mockResolvedValue(
      MOCK_REWARDS.map((r) => ({ ...r, is_active: false })),
    );

    await renderPage();

    expect(screen.getByText(/no hay recompensas activas/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /progreso de clientes/i }),
    ).not.toBeInTheDocument();
  });

  it("shows empty-customers notice when no customer progress data exists", async () => {
    vi.mocked(getCustomerRewardProgressList).mockResolvedValue([]);

    await renderPage();

    expect(
      screen.getByText(/no hay clientes registrados aún/i),
    ).toBeInTheDocument();
  });

  it("renders an error banner when data fetching fails", async () => {
    vi.mocked(getRewardRulesForCurrentBusiness).mockRejectedValue(
      new Error("Error de conexión"),
    );

    await renderPage();

    expect(
      screen.getByText(/no se puede acceder a las recompensas/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Error de conexión")).toBeInTheDocument();
  });

  it("hides the form and tables when an error occurs", async () => {
    vi.mocked(getRewardRulesForCurrentBusiness).mockRejectedValue(
      new Error("DB failure"),
    );

    await renderPage();

    expect(screen.queryByTestId("reward-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("reward-rules-table")).not.toBeInTheDocument();
  });
});
