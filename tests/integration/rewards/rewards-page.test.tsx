import { render, screen, within } from "@testing-library/react";
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
    is_active: true,
    created_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "rule-3",
    business_id: "biz-1",
    name: "Postre Premium",
    points_required: 300,
    reward_description: "Postre premium gratis",
    is_active: true,
    created_at: "2024-01-03T00:00:00Z",
  },
];

const MOCK_PROGRESS: CustomerRewardProgress[] = [
  {
    customer_id: "cust-1",
    customer_name: "Ana García",
    current_points: 75,
    redeemable_reward: null,
    next_reward: MOCK_REWARDS[0],
    progress_percentage_to_next: 75,
    remaining_points_to_next: 25,
    status: "in_progress",
  },
  {
    customer_id: "cust-2",
    customer_name: "Luis Pérez",
    current_points: 120,
    redeemable_reward: MOCK_REWARDS[0],
    next_reward: MOCK_REWARDS[1],
    progress_percentage_to_next: 20,
    remaining_points_to_next: 80,
    status: "redeemable",
  },
  {
    customer_id: "cust-3",
    customer_name: "María Rodríguez",
    current_points: 350,
    redeemable_reward: MOCK_REWARDS[2],
    next_reward: null,
    progress_percentage_to_next: 100,
    remaining_points_to_next: 0,
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

  describe("Page structure", () => {
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
        screen.getByRole("heading", {
          name: /reglas de recompensa/i,
          level: 2,
        }),
      ).toBeInTheDocument();
    });

    it("renders the reward rules table with fetched rules", async () => {
      await renderPage();

      const rewardRulesTable = screen.getByTestId("reward-rules-table");
      expect(rewardRulesTable).toBeInTheDocument();
      expect(
        within(rewardRulesTable).getByText("Café Gratis"),
      ).toBeInTheDocument();
      expect(
        within(rewardRulesTable).getByText("Descuento 10%"),
      ).toBeInTheDocument();
    });

    it("renders the customer progress section heading when active rewards exist", async () => {
      await renderPage();

      expect(
        screen.getByRole("heading", {
          name: /progreso de clientes/i,
          level: 2,
        }),
      ).toBeInTheDocument();
    });
  });

  describe("Reward cards: In-progress state", () => {
    it("displays customer name and current points for in-progress customer", async () => {
      await renderPage();

      expect(screen.getByText("Ana García")).toBeInTheDocument();
      expect(screen.getByText(/75 puntos/)).toBeInTheDocument();
    });

    it("renders 'En progreso' badge for customer below first reward", async () => {
      await renderPage();

      const progressBadges = screen.getAllByText(/en progreso/i);
      expect(progressBadges.length).toBeGreaterThan(0);
    });

    it("shows next goal section with reward details and progress bar", async () => {
      await renderPage();

      // Verify next goal section exists
      const nextGoalSections = screen.queryAllByText(/próxima meta/i);
      expect(nextGoalSections.length).toBeGreaterThan(0);

      // Check for the specific reward description to verify content
      const cafeDescriptions = screen.queryAllByText(
        /un café gratis después de 10 visitas/i,
      );
      expect(cafeDescriptions.length).toBeGreaterThan(0);
      expect(
        screen.getByText(/25 puntos para la siguiente recompensa/i),
      ).toBeInTheDocument();
    });

    it("displays progress percentage in progress bar section", async () => {
      await renderPage();

      expect(screen.getByText("75%")).toBeInTheDocument();
    });
  });

  describe("Reward cards: Redeemable state with next goal", () => {
    it("displays 'Canjeable' badge for redeemable customer", async () => {
      await renderPage();

      const rewardBadges = screen.getAllByText(/canjeable/i);
      expect(rewardBadges.length).toBeGreaterThan(0);
    });

    it("shows redeemable reward section with earned reward details", async () => {
      await renderPage();

      const rewardSections = screen.queryAllByText(/recompensa disponible/i);
      expect(rewardSections.length).toBeGreaterThan(0);

      // Verify the redeemable reward descriptions are displayed
      const cafeDescriptions = screen.queryAllByText(
        /un café gratis después de 10 visitas/i,
      );
      expect(cafeDescriptions.length).toBeGreaterThan(0);
    });

    it("shows next goal section with upcoming reward and progress bar", async () => {
      await renderPage();

      // For Luis Pérez: redeemable reward is Café Gratis, next goal is Descuento 10%
      const nextGoalSections = screen.queryAllByText(/próxima meta/i);
      expect(nextGoalSections.length).toBeGreaterThan(0);

      // Verify next goal section exists by checking for its specific description
      expect(
        screen.getByText("10% de descuento en su próxima compra"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/80 puntos para la siguiente recompensa/i),
      ).toBeInTheDocument();
    });

    it("displays progress percentage for next goal", async () => {
      await renderPage();

      // Luis has 20% progress toward next reward
      expect(screen.getByText("20%")).toBeInTheDocument();
    });
  });

  describe("Reward cards: Highest reward reached (no next goal)", () => {
    it("does not show next goal section when customer reached highest reward", async () => {
      const mockProgressHighestReward: CustomerRewardProgress[] = [
        {
          customer_id: "cust-3",
          customer_name: "María Rodríguez",
          current_points: 350,
          redeemable_reward: MOCK_REWARDS[2],
          next_reward: null,
          progress_percentage_to_next: 100,
          remaining_points_to_next: 0,
          status: "redeemable",
        },
      ];
      vi.mocked(getCustomerRewardProgressList).mockResolvedValue(
        mockProgressHighestReward,
      );

      await renderPage();

      expect(screen.getByText("María Rodríguez")).toBeInTheDocument();
      expect(screen.getByText(/recompensa disponible/i)).toBeInTheDocument();
      // Should NOT have "Próxima meta" section when no next reward
      expect(screen.queryByText(/próxima meta/i)).not.toBeInTheDocument();
    });

    it("displays highest reward for customer at max level without next goal", async () => {
      const mockProgressHighestReward: CustomerRewardProgress[] = [
        {
          customer_id: "cust-3",
          customer_name: "María Rodríguez",
          current_points: 350,
          redeemable_reward: MOCK_REWARDS[2],
          next_reward: null,
          progress_percentage_to_next: 100,
          remaining_points_to_next: 0,
          status: "redeemable",
        },
      ];
      vi.mocked(getCustomerRewardProgressList).mockResolvedValue(
        mockProgressHighestReward,
      );

      await renderPage();

      const rewardSections = screen.queryAllByText(/recompensa disponible/i);
      expect(rewardSections.length).toBeGreaterThan(0);
    });
  });

  describe("Multiple customers rendering", () => {
    it("renders a card for each customer in progress list", async () => {
      await renderPage();

      expect(screen.getByText("Ana García")).toBeInTheDocument();
      expect(screen.getByText("Luis Pérez")).toBeInTheDocument();
      expect(screen.getByText("María Rodríguez")).toBeInTheDocument();
    });

    it("renders correct status badges for all customers", async () => {
      await renderPage();

      // 1 "En progreso" for Ana, 2 "Canjeable" for Luis and María
      const progressBadges = screen.getAllByText(/en progreso/i);
      const rewardBadges = screen.getAllByText(/canjeable/i);

      expect(progressBadges.length).toBeGreaterThanOrEqual(1);
      expect(rewardBadges.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Empty states", () => {
    it("shows empty-customers notice when no customer progress data exists", async () => {
      vi.mocked(getCustomerRewardProgressList).mockResolvedValue([]);

      await renderPage();

      expect(
        screen.getByText(/no hay clientes registrados aún/i),
      ).toBeInTheDocument();
    });

    it("hides customer progress section when no active reward rules exist", async () => {
      vi.mocked(getRewardRulesForCurrentBusiness).mockResolvedValue(
        MOCK_REWARDS.map((r) => ({ ...r, is_active: false })),
      );

      await renderPage();

      expect(
        screen.queryByRole("heading", { name: /progreso de clientes/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
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
      expect(
        screen.queryByTestId("reward-rules-table"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /progreso de clientes/i }),
      ).not.toBeInTheDocument();
    });
  });
});
