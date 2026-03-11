import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import DashboardPage from "@/app/dashboard/page";
import { getCustomersWithPointsForCurrentBusiness } from "@/lib/customers/data";

vi.mock("@/lib/customers/data", () => ({
  getCustomersWithPointsForCurrentBusiness: vi.fn(),
}));

describe("Dashboard integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCustomersWithPointsForCurrentBusiness).mockResolvedValue([]);
  });

  it("renders the dashboard page title", async () => {
    render(await DashboardPage());
    expect(
      screen.getByRole("heading", { name: "Dashboard", level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders all navigation menu items with correct links", async () => {
    render(await DashboardPage());

    const navItems = [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Customers", href: "/dashboard/customers" },
      {
        label: "Inactive Customers",
        href: "/dashboard/inactive-customers",
      },
      { label: "Visits", href: "/dashboard/visits" },
      { label: "Rewards", href: "/dashboard/rewards" },
      { label: "Campaigns", href: "/dashboard/campaigns" },
    ];

    navItems.forEach((item) => {
      const link = screen.getByRole("link", {
        name: new RegExp(`^[^A-Za-z]*${item.label}$`),
      });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", item.href);
    });
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
      screen.getByText("Recent visits and customer activity will appear here"),
    ).toBeInTheDocument();
  });

  it("displays trend indicators for metrics", async () => {
    render(await DashboardPage());

    expect(screen.getByText("+12% this month")).toBeInTheDocument();
    expect(screen.getByText("+8% vs last month")).toBeInTheDocument();
    expect(screen.getByText("+24% this month")).toBeInTheDocument();
    expect(screen.getByText("+3% engagement")).toBeInTheDocument();
  });

  it("renders the app branding", async () => {
    render(await DashboardPage());

    expect(screen.getByText("ReturnOS")).toBeInTheDocument();
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
    vi.mocked(getCustomersWithPointsForCurrentBusiness).mockResolvedValue([
      {
        id: "c1",
        name: "Customer 1",
        phone: "555-0001",
        points: 10,
        last_visit_at: "2025-02-20T12:00:00Z",
      },
      {
        id: "c2",
        name: "Customer 2",
        phone: "555-0002",
        points: 20,
        last_visit_at: "2025-02-19T12:00:00Z",
      },
      {
        id: "c3",
        name: "Customer 3",
        phone: "555-0003",
        points: 30,
        last_visit_at: "2025-02-18T12:00:00Z",
      },
      {
        id: "c4",
        name: "Customer 4",
        phone: "555-0004",
        points: 40,
        last_visit_at: "2025-02-17T12:00:00Z",
      },
      {
        id: "c5",
        name: "Customer 5",
        phone: "555-0005",
        points: 50,
        last_visit_at: "2025-02-16T12:00:00Z",
      },
      {
        id: "c6",
        name: "Customer 6",
        phone: "555-0006",
        points: 60,
        last_visit_at: "2025-02-15T12:00:00Z",
      },
    ]);

    render(await DashboardPage());

    expect(screen.getByText("Customer 6")).toBeInTheDocument();
    expect(screen.getByText("Customer 2")).toBeInTheDocument();
    expect(screen.queryByText("Customer 1")).not.toBeInTheDocument();
  });
});
