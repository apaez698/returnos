import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

describe("Dashboard integration", () => {
  beforeEach(() => {
    // Use Next.js router mocking if needed
  });

  it("renders the dashboard page title", () => {
    render(<DashboardPage />);
    expect(
      screen.getByRole("heading", { name: "Dashboard", level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders all navigation menu items with correct links", () => {
    render(<DashboardPage />);

    const navItems = [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Customers", href: "/dashboard/customers" },
      { label: "Visits", href: "/dashboard/visits" },
      { label: "Rewards", href: "/dashboard/rewards" },
      { label: "Campaigns", href: "/dashboard/campaigns" },
    ];

    navItems.forEach((item) => {
      const link = screen.getByRole("link", { name: new RegExp(item.label) });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", item.href);
    });
  });

  it("renders all metric cards with expected labels", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Total Customers")).toBeInTheDocument();
    expect(screen.getByText("Active Visits")).toBeInTheDocument();
    expect(screen.getByText("Rewards Redeemed")).toBeInTheDocument();
    expect(screen.getByText("Campaign Reach")).toBeInTheDocument();
  });

  it("displays metric values", () => {
    render(<DashboardPage />);

    expect(screen.getByText("284")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("156")).toBeInTheDocument();
    expect(screen.getByText("892")).toBeInTheDocument();
  });

  it("renders the recent activity section", () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole("heading", { name: "Recent Activity", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Recent visits and customer activity will appear here"),
    ).toBeInTheDocument();
  });

  it("displays trend indicators for metrics", () => {
    render(<DashboardPage />);

    expect(screen.getByText("+12% this month")).toBeInTheDocument();
    expect(screen.getByText("+8% vs last month")).toBeInTheDocument();
    expect(screen.getByText("+24% this month")).toBeInTheDocument();
    expect(screen.getByText("+3% engagement")).toBeInTheDocument();
  });

  it("renders the app branding", () => {
    render(<DashboardPage />);

    expect(screen.getByText("ReturnOS")).toBeInTheDocument();
  });
});
