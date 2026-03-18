import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import DashboardPage from "@/app/dashboard/page";
import { getDashboardDataForCurrentBusiness } from "@/lib/dashboard/data";
import type { InactiveCustomer } from "@/lib/customers/inactivity";
import type { DashboardActivityItem } from "@/lib/dashboard/data";

vi.mock("@/lib/dashboard/data", () => ({
  getDashboardDataForCurrentBusiness: vi.fn(),
}));

// ============================================================
// Mock data
// ============================================================

const MOCK_INACTIVE_CUSTOMERS: InactiveCustomer[] = [
  {
    customerId: "c1",
    name: "Ana García",
    phone: "555-0001",
    points: 150,
    lastVisitAt: "2026-01-15T12:00:00Z",
    daysSinceLastVisit: 55,
  },
  {
    customerId: "c2",
    name: "Luis Martínez",
    phone: "555-0002",
    points: 80,
    lastVisitAt: "2026-02-01T12:00:00Z",
    daysSinceLastVisit: 38,
  },
];

const MOCK_RECENT_ACTIVITY: DashboardActivityItem[] = [
  {
    id: "visit-1",
    type: "visit",
    customerName: "Carlos Pérez",
    description: "Carlos Pérez visit (+10 pts)",
    createdAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "redemption-1",
    type: "redemption",
    customerName: "María López",
    description: "María López redeemed Café Gratis (100 pts)",
    createdAt: "2026-03-09T15:30:00Z",
  },
];

const MOCK_DASHBOARD_DATA = {
  metrics: {
    totalCustomers: 284,
    totalVisits: 1234,
    rewardsRedeemed: 156,
    campaignReach: 892,
  },
  inactiveSummary: MOCK_INACTIVE_CUSTOMERS,
  recentActivity: MOCK_RECENT_ACTIVITY,
};

async function renderPage() {
  render(await DashboardPage());
}

// ============================================================
// Tests
// ============================================================

describe("DashboardPage — real-data integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDashboardDataForCurrentBusiness).mockResolvedValue(
      MOCK_DASHBOARD_DATA as never,
    );
  });

  // ----------------------------------------------------------
  // Metric cards
  // ----------------------------------------------------------

  describe("metric cards", () => {
    it("renders all four metric card labels", async () => {
      await renderPage();

      expect(screen.getByText("Total de clientes")).toBeInTheDocument();
      expect(screen.getByText("Visitas activas")).toBeInTheDocument();
      expect(screen.getByText("Recompensas canjeadas")).toBeInTheDocument();
      expect(screen.getByText("Alcance de campañas")).toBeInTheDocument();
    });

    it("renders totalCustomers value from mocked data", async () => {
      await renderPage();

      expect(screen.getByText("284")).toBeInTheDocument();
    });

    it("renders totalVisits with thousands-separator formatting", async () => {
      await renderPage();

      expect(screen.getByText("1,234")).toBeInTheDocument();
    });

    it("renders totalRewardsRedeemed value from mocked data", async () => {
      await renderPage();

      expect(screen.getByText("156")).toBeInTheDocument();
    });

    it("renders campaignReach value from mocked data", async () => {
      await renderPage();

      expect(screen.getByText("892")).toBeInTheDocument();
    });

    it("renders metric trend labels beneath each card", async () => {
      await renderPage();

      expect(screen.getByText("Total del negocio")).toBeInTheDocument();
      expect(screen.getByText("Últimos 30 días")).toBeInTheDocument();
      expect(screen.getByText("Histórico total")).toBeInTheDocument();
      expect(screen.getByText("De envíos de campaña")).toBeInTheDocument();
    });

    it("renders all metrics as zero when data contains zero values", async () => {
      vi.mocked(getDashboardDataForCurrentBusiness).mockResolvedValue({
        ...MOCK_DASHBOARD_DATA,
        metrics: {
          totalCustomers: 0,
          totalVisits: 0,
          rewardsRedeemed: 0,
          campaignReach: 0,
        },
      } as never);

      await renderPage();

      const zeros = screen.getAllByText("0");
      expect(zeros).toHaveLength(4);
    });
  });

  // ----------------------------------------------------------
  // Inactive customers
  // ----------------------------------------------------------

  describe("inactive customers section", () => {
    it("renders the section heading", async () => {
      await renderPage();

      expect(
        screen.getByRole("heading", { name: "Clientes inactivos", level: 2 }),
      ).toBeInTheDocument();
    });

    it("renders the 'View all' link pointing to /dashboard/inactive-customers", async () => {
      await renderPage();

      expect(screen.getByRole("link", { name: "Ver todos" })).toHaveAttribute(
        "href",
        "/dashboard/inactive-customers",
      );
    });

    it("renders customer names from mocked data", async () => {
      await renderPage();

      expect(screen.getByText("Ana García")).toBeInTheDocument();
      expect(screen.getByText("Luis Martínez")).toBeInTheDocument();
    });

    it("renders days-inactive count for each customer", async () => {
      await renderPage();

      expect(screen.getByText("55 días sin visitar")).toBeInTheDocument();
      expect(screen.getByText("38 días sin visitar")).toBeInTheDocument();
    });

    it("renders all customers when multiple are present", async () => {
      const fiveCustomers: InactiveCustomer[] = [
        {
          customerId: "c1",
          name: "Beatriz Ruiz",
          phone: "555-0001",
          points: 20,
          lastVisitAt: "2026-01-01T00:00:00Z",
          daysSinceLastVisit: 69,
        },
        {
          customerId: "c2",
          name: "Eduardo Soto",
          phone: "555-0002",
          points: 40,
          lastVisitAt: "2026-01-10T00:00:00Z",
          daysSinceLastVisit: 60,
        },
        {
          customerId: "c3",
          name: "Fernanda Cruz",
          phone: "555-0003",
          points: 60,
          lastVisitAt: "2026-01-20T00:00:00Z",
          daysSinceLastVisit: 50,
        },
        {
          customerId: "c4",
          name: "Gerardo Luna",
          phone: "555-0004",
          points: 80,
          lastVisitAt: "2026-02-01T00:00:00Z",
          daysSinceLastVisit: 38,
        },
        {
          customerId: "c5",
          name: "Hilda Morales",
          phone: "555-0005",
          points: 100,
          lastVisitAt: "2026-02-10T00:00:00Z",
          daysSinceLastVisit: 29,
        },
      ];

      vi.mocked(getDashboardDataForCurrentBusiness).mockResolvedValue({
        ...MOCK_DASHBOARD_DATA,
        inactiveSummary: fiveCustomers,
      } as never);

      await renderPage();

      for (const customer of fiveCustomers) {
        expect(screen.getByText(customer.name)).toBeInTheDocument();
      }
    });

    it("renders ∞ days inactive when daysSinceLastVisit is null", async () => {
      vi.mocked(getDashboardDataForCurrentBusiness).mockResolvedValue({
        ...MOCK_DASHBOARD_DATA,
        inactiveSummary: [
          {
            customerId: "c3",
            name: "Nuevo Cliente",
            phone: "555-0003",
            points: 0,
            lastVisitAt: null,
            daysSinceLastVisit: null,
          },
        ],
      } as never);

      await renderPage();

      expect(screen.getByText("∞ días sin visitar")).toBeInTheDocument();
    });

    it("does not show the empty-state message when inactive customers are present", async () => {
      await renderPage();

      expect(
        screen.queryByText("Sin clientes inactivos por ahora."),
      ).not.toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // Recent activity
  // ----------------------------------------------------------

  describe("recent activity section", () => {
    it("renders the 'Actividad reciente' section heading", async () => {
      await renderPage();

      expect(
        screen.getByRole("heading", { name: "Actividad reciente", level: 2 }),
      ).toBeInTheDocument();
    });

    it("renders visit activity description from mocked data", async () => {
      await renderPage();

      expect(
        screen.getByText("Carlos Pérez visit (+10 pts)"),
      ).toBeInTheDocument();
    });

    it("renders reward redemption activity description from mocked data", async () => {
      await renderPage();

      expect(
        screen.getByText("María López redeemed Café Gratis (100 pts)"),
      ).toBeInTheDocument();
    });

    it("renders a formatted date for the visit activity item", async () => {
      await renderPage();

      const expectedDate = new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date("2026-03-10T10:00:00Z"));

      expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });

    it("renders a formatted date for the redemption activity item", async () => {
      await renderPage();

      const expectedDate = new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date("2026-03-09T15:30:00Z"));

      expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });

    it("renders both visit and redemption activity items together", async () => {
      await renderPage();

      expect(
        screen.getByText("Carlos Pérez visit (+10 pts)"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("María López redeemed Café Gratis (100 pts)"),
      ).toBeInTheDocument();
    });

    it("does not show the empty-state message when activity is present", async () => {
      await renderPage();

      expect(
        screen.queryByText("Aún no hay visitas ni canjes recientes."),
      ).not.toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // Empty states
  // ----------------------------------------------------------

  describe("empty states", () => {
    it("shows empty-state text when there are no inactive customers", async () => {
      vi.mocked(getDashboardDataForCurrentBusiness).mockResolvedValue({
        ...MOCK_DASHBOARD_DATA,
        inactiveSummary: [],
      } as never);

      await renderPage();

      expect(
        screen.getByText("Sin clientes inactivos por ahora."),
      ).toBeInTheDocument();
    });

    it("shows empty-state text when there is no recent activity", async () => {
      vi.mocked(getDashboardDataForCurrentBusiness).mockResolvedValue({
        ...MOCK_DASHBOARD_DATA,
        recentActivity: [],
      } as never);

      await renderPage();

      expect(
        screen.getByText("Aún no hay visitas ni canjes recientes."),
      ).toBeInTheDocument();
    });

    it("shows both empty states when all data is empty", async () => {
      vi.mocked(getDashboardDataForCurrentBusiness).mockResolvedValue({
        ...MOCK_DASHBOARD_DATA,
        inactiveSummary: [],
        recentActivity: [],
      } as never);

      await renderPage();

      expect(
        screen.getByText("Sin clientes inactivos por ahora."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Aún no hay visitas ni canjes recientes."),
      ).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // Error recovery
  // ----------------------------------------------------------

  describe("error recovery", () => {
    beforeEach(() => {
      vi.mocked(getDashboardDataForCurrentBusiness).mockRejectedValue(
        new Error("Network error"),
      );
    });

    it("renders zeros for all metric cards when the data fetch throws", async () => {
      await renderPage();

      const zeros = screen.getAllByText("0");
      expect(zeros).toHaveLength(4);
    });

    it("shows inactive customers empty state when the data fetch throws", async () => {
      await renderPage();

      expect(
        screen.getByText("Sin clientes inactivos por ahora."),
      ).toBeInTheDocument();
    });

    it("shows recent activity empty state when the data fetch throws", async () => {
      await renderPage();

      expect(
        screen.getByText("Aún no hay visitas ni canjes recientes."),
      ).toBeInTheDocument();
    });

    it("still renders the page title when the data fetch throws", async () => {
      await renderPage();

      expect(
        screen.getByRole("heading", { name: "Dashboard", level: 1 }),
      ).toBeInTheDocument();
    });
  });
});
