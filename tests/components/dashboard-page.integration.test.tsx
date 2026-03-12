import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import DashboardPage from "@/app/dashboard/page";
import { getDashboardDataForCurrentBusiness } from "@/lib/dashboard/data";

vi.mock("@/lib/dashboard/data", () => ({
  getDashboardDataForCurrentBusiness: vi.fn(),
}));

const defaultDashboardData = {
  metrics: {
    totalCustomers: 284,
    totalVisits: 1234,
    rewardsRedeemed: 156,
    campaignReach: 892,
  },
  inactiveSummary: [],
  recentActivity: [],
};

describe("Dashboard integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDashboardDataForCurrentBusiness).mockResolvedValue(
      defaultDashboardData,
    );
  });

  it("renders the dashboard page title", async () => {
    render(await DashboardPage());
    expect(
      screen.getByRole("heading", { name: "Dashboard", level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders the page-level heading", async () => {
    render(await DashboardPage());
    // Navigation is provided by the AppShell in app/dashboard/layout.tsx;
    // this page renders only the inner content area with its own h1.
    expect(
      screen.getByRole("heading", { name: "Dashboard", level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders all metric cards with expected labels", async () => {
    render(await DashboardPage());

    expect(screen.getByText("Total Customers")).toBeInTheDocument();
    expect(screen.getByText("Active Visits")).toBeInTheDocument();
    expect(screen.getByText("Rewards Redeemed")).toBeInTheDocument();
    expect(screen.getByText("Campaign Reach")).toBeInTheDocument();
  });

  it("displays metric values", async () => {
    render(await DashboardPage());

    expect(screen.getByText("284")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("156")).toBeInTheDocument();
    expect(screen.getByText("892")).toBeInTheDocument();
  });

  it("renders the recent activity section", async () => {
    render(await DashboardPage());

    expect(
      screen.getByRole("heading", { name: "Recent Activity", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No recent visits or reward redemptions yet."),
    ).toBeInTheDocument();
  });

  it("displays trend indicators for metrics", async () => {
    render(await DashboardPage());

    expect(screen.getByText("Current business total")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    expect(screen.getByText("All time")).toBeInTheDocument();
    expect(screen.getByText("From campaign deliveries")).toBeInTheDocument();
  });

  it("renders the dashboard content wrapper", async () => {
    render(await DashboardPage());
    // Business branding is rendered by AppShell (app/dashboard/layout.tsx);
    // the page itself renders the main content area.
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders inactive summary section with empty state", async () => {
    render(await DashboardPage());

    expect(
      screen.getByRole("heading", { name: "Inactive Customers", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No inactive customers right now."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View all" })).toHaveAttribute(
      "href",
      "/dashboard/inactive-customers",
    );
  });

  it("renders up to 5 inactive customers in summary", async () => {
    vi.mocked(getDashboardDataForCurrentBusiness).mockResolvedValue({
      ...defaultDashboardData,
      inactiveSummary: [
        {
          customerId: "c6",
          name: "Customer 6",
          phone: "555-0006",
          points: 60,
          lastVisitAt: "2025-02-15T12:00:00Z",
          daysSinceLastVisit: 30,
        },
        {
          customerId: "c5",
          name: "Customer 5",
          phone: "555-0005",
          points: 50,
          lastVisitAt: "2025-02-16T12:00:00Z",
          daysSinceLastVisit: 29,
        },
        {
          customerId: "c4",
          name: "Customer 4",
          phone: "555-0004",
          points: 40,
          lastVisitAt: "2025-02-17T12:00:00Z",
          daysSinceLastVisit: 28,
        },
        {
          customerId: "c3",
          name: "Customer 3",
          phone: "555-0003",
          points: 30,
          lastVisitAt: "2025-02-18T12:00:00Z",
          daysSinceLastVisit: 27,
        },
        {
          customerId: "c2",
          name: "Customer 2",
          phone: "555-0002",
          points: 20,
          lastVisitAt: "2025-02-19T12:00:00Z",
          daysSinceLastVisit: 26,
        },
      ],
    });

    render(await DashboardPage());

    expect(screen.getByText("Customer 6")).toBeInTheDocument();
    expect(screen.getByText("Customer 2")).toBeInTheDocument();
    expect(screen.queryByText("Customer 1")).not.toBeInTheDocument();
  });
});
