import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { searchRewardCustomers } from "@/features/rewards/queries/search-reward-customers";
import DashboardRewardsPage from "@/app/dashboard/rewards/page";
import { getRewardRulesForCurrentBusiness } from "@/lib/rewards/data";
import type { RewardCustomerSearchItem } from "@/lib/rewards/reward-customer-types";
import type { RewardRule } from "@/lib/rewards/types";

vi.mock("@/lib/rewards/data", () => ({
  getRewardRulesForCurrentBusiness: vi.fn(),
}));

vi.mock("@/features/rewards/queries/search-reward-customers", () => ({
  searchRewardCustomers: vi.fn(),
}));

vi.mock("@/app/dashboard/rewards/actions", () => ({
  createRewardRuleAction: vi.fn(),
  toggleRewardRuleAction: vi.fn(),
  deleteRewardRuleAction: vi.fn(),
  redeemRewardAction: vi.fn(async () => ({
    success: true,
    error: null,
    message: "Canje registrado",
  })),
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
    name: "Pastry Reward",
    points_required: 50,
    reward_description: "Redeemable for one pastry item of your choice",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "rule-2",
    business_id: "biz-1",
    name: "Coffee Combo",
    points_required: 100,
    reward_description: "Coffee and pastry combo",
    is_active: true,
    created_at: "2024-01-02T00:00:00Z",
  },
];

const MOCK_CUSTOMERS: RewardCustomerSearchItem[] = [
  {
    customer_id: "cust-1",
    customer_name: "Ana María Ortiz",
    customer_phone: "+593963333034",
    current_points: 13,
    redemptions_count: 1,
    redeemable_reward_id: null,
    redeemable_reward_name: null,
    redeemable_reward_description: null,
    redeemable_reward_points_required: null,
    next_reward_id: "rule-1",
    next_reward_name: "Pastry Reward",
    next_reward_description: "Redeemable for one pastry item of your choice",
    next_reward_points_required: 50,
    progress_percentage_to_next: 26,
    remaining_points_to_next: 37,
    has_redeemed: true,
    is_eligible: false,
    is_near_unlock: false,
    reward_status: "redeemed",
  },
  {
    customer_id: "cust-2",
    customer_name: "Viviana Mejía Sánchez",
    customer_phone: "+5255989018901",
    current_points: 41,
    redemptions_count: 0,
    redeemable_reward_id: null,
    redeemable_reward_name: null,
    redeemable_reward_description: null,
    redeemable_reward_points_required: null,
    next_reward_id: "rule-1",
    next_reward_name: "Pastry Reward",
    next_reward_description: "Redeemable for one pastry item of your choice",
    next_reward_points_required: 50,
    progress_percentage_to_next: 82,
    remaining_points_to_next: 9,
    has_redeemed: false,
    is_eligible: false,
    is_near_unlock: true,
    reward_status: "near_unlock",
  },
  {
    customer_id: "cust-3",
    customer_name: "Ricardo Solis Barrera",
    customer_phone: "+525500000001",
    current_points: 32,
    redemptions_count: 0,
    redeemable_reward_id: null,
    redeemable_reward_name: null,
    redeemable_reward_description: null,
    redeemable_reward_points_required: null,
    next_reward_id: "rule-1",
    next_reward_name: "Pastry Reward",
    next_reward_description: "Redeemable for one pastry item of your choice",
    next_reward_points_required: 50,
    progress_percentage_to_next: 64,
    remaining_points_to_next: 18,
    has_redeemed: false,
    is_eligible: false,
    is_near_unlock: false,
    reward_status: "active",
  },
  {
    customer_id: "cust-4",
    customer_name: "Luis Pérez",
    customer_phone: "+525500000002",
    current_points: 120,
    redemptions_count: 0,
    redeemable_reward_id: "rule-2",
    redeemable_reward_name: "Coffee Combo",
    redeemable_reward_description: "Coffee and pastry combo",
    redeemable_reward_points_required: 100,
    next_reward_id: null,
    next_reward_name: null,
    next_reward_description: null,
    next_reward_points_required: null,
    progress_percentage_to_next: 100,
    remaining_points_to_next: 0,
    has_redeemed: false,
    is_eligible: true,
    is_near_unlock: false,
    reward_status: "eligible",
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
    vi.mocked(searchRewardCustomers).mockResolvedValue({
      items: MOCK_CUSTOMERS,
      total_count: MOCK_CUSTOMERS.length,
    });
  });

  it("renders page structure and searchable rewards controls", async () => {
    await renderPage();

    expect(
      screen.getByRole("heading", { name: "Recompensas", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("reward-form")).toBeInTheDocument();
    expect(screen.getByTestId("reward-rules-table")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /progreso de clientes/i,
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("searchbox", { name: /buscar cliente/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /canjeables/i }),
    ).toBeInTheDocument();
  });

  it("renders customer cards from searchable data", async () => {
    await renderPage();

    expect(screen.getByText("Ana María Ortiz")).toBeInTheDocument();
    expect(screen.getByText("Viviana Mejía Sánchez")).toBeInTheDocument();
    expect(screen.getByText("Luis Pérez")).toBeInTheDocument();
    expect(screen.getByText(/mostrando 4 de 4 clientes/i)).toBeInTheDocument();
  });

  it("filters by text query (name or phone)", async () => {
    const user = userEvent.setup();
    await renderPage();

    const searchInput = screen.getByRole("searchbox", {
      name: /buscar cliente/i,
    });
    await user.clear(searchInput);
    await user.type(searchInput, "ana");

    expect(screen.getByText("Ana María Ortiz")).toBeInTheDocument();
    expect(screen.queryByText("Ricardo Solis Barrera")).not.toBeInTheDocument();
    expect(screen.getByText(/mostrando 2 de 4 clientes/i)).toBeInTheDocument();
  });

  it("filters by status chips", async () => {
    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole("button", { name: /canjeables/i }));

    expect(screen.getByText("Luis Pérez")).toBeInTheDocument();
    expect(screen.queryByText("Ana María Ortiz")).not.toBeInTheDocument();
    expect(screen.queryByText("Viviana Mejía Sánchez")).not.toBeInTheDocument();
    expect(screen.getByText(/mostrando 1 de 4 clientes/i)).toBeInTheDocument();
  });

  it("shows friendly empty state when filters remove all customers", async () => {
    const user = userEvent.setup();
    await renderPage();

    const searchInput = screen.getByRole("searchbox", {
      name: /buscar cliente/i,
    });
    await user.clear(searchInput);
    await user.type(searchInput, "cliente inexistente");

    expect(screen.getByText(/no encontramos clientes/i)).toBeInTheDocument();
    expect(
      screen.getByText(/prueba otro nombre, telefono o filtro/i),
    ).toBeInTheDocument();
  });

  it("shows no-active-rewards warning when all rules are inactive", async () => {
    vi.mocked(getRewardRulesForCurrentBusiness).mockResolvedValue(
      MOCK_REWARDS.map((reward) => ({ ...reward, is_active: false })),
    );

    await renderPage();

    expect(screen.getByText(/no hay recompensas activas/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("searchbox", { name: /buscar cliente/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps page functional when searchable query fails", async () => {
    vi.mocked(searchRewardCustomers).mockRejectedValue(
      new Error("search fail"),
    );

    await renderPage();

    expect(screen.getByTestId("reward-form")).toBeInTheDocument();
    expect(screen.getByTestId("reward-rules-table")).toBeInTheDocument();
    expect(screen.getByText(/mostrando 0 de 0 clientes/i)).toBeInTheDocument();
    expect(screen.getByText(/no encontramos clientes/i)).toBeInTheDocument();
  });

  it("renders error banner when rewards module fails", async () => {
    vi.mocked(getRewardRulesForCurrentBusiness).mockRejectedValue(
      new Error("Error de conexión"),
    );

    await renderPage();

    expect(
      screen.getByText(/no se puede acceder a las recompensas/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Error de conexión")).toBeInTheDocument();
    expect(screen.queryByTestId("reward-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("reward-rules-table")).not.toBeInTheDocument();
  });
});
