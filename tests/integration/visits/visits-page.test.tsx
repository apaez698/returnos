import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import DashboardVisitsPage from "@/app/dashboard/visits/page";
import { getCustomersForCurrentBusiness } from "@/lib/customers/data";
import { getRecentVisitsForCurrentBusiness } from "@/lib/visits/data";

vi.mock("@/lib/customers/data", () => ({
  getCustomersForCurrentBusiness: vi.fn(),
}));

vi.mock("@/lib/visits/data", () => ({
  getRecentVisitsForCurrentBusiness: vi.fn(),
}));

vi.mock("@/app/dashboard/visits/actions", () => ({
  createVisitAction: vi.fn(),
}));

const MOCK_CUSTOMERS = [
  {
    id: "customer-1",
    name: "Juan Perez",
    phone: "555-0001",
    email: "juan@example.com",
    birthday: null,
    consent_marketing: true,
    last_visit_at: null,
  },
];

const MOCK_VISITS = [
  {
    id: "visit-1",
    customer_id: "customer-1",
    customer_name: "Juan Perez",
    points_earned: 10,
    amount: 120,
    product_category: "Cafe",
    source: "manual" as const,
    created_at: "2026-03-10T10:00:00Z",
  },
];

async function renderPage() {
  const jsx = await DashboardVisitsPage();
  render(jsx);
}

describe("DashboardVisitsPage (/dashboard/visits)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCustomersForCurrentBusiness).mockResolvedValue(MOCK_CUSTOMERS);
    vi.mocked(getRecentVisitsForCurrentBusiness).mockResolvedValue(MOCK_VISITS);
  });

  it("renders the page title and description", async () => {
    await renderPage();

    expect(
      screen.getByRole("heading", { name: "Visitas", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Registra visitas de clientes en caja y mantiene sus puntos siempre actualizados\./i,
      ),
    ).toBeInTheDocument();
  });

  it("renders the visit form", async () => {
    await renderPage();

    expect(
      screen.getByRole("heading", { name: "Registrar visita", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar visita" }),
    ).toBeInTheDocument();
  });

  it("renders recent visits when data exists", async () => {
    await renderPage();

    expect(
      screen.getByRole("heading", { name: "Visitas recientes", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Juan Perez")).toBeInTheDocument();
    expect(screen.getByText("+10")).toBeInTheDocument();
  });
});
