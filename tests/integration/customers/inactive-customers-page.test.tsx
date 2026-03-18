import { render, screen, within } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ReactNode } from "react";
import { getCustomersWithPointsForCurrentBusiness } from "@/lib/customers/data";
import DashboardInactiveCustomersPage from "@/app/dashboard/inactive-customers/page";

vi.mock("@/lib/customers/data", () => ({
  getCustomersWithPointsForCurrentBusiness: vi.fn(),
}));

vi.mock("@/components/dashboard/dashboard-layout", () => ({
  DashboardLayout: ({
    children,
    pageTitle,
  }: {
    children: ReactNode;
    pageTitle: string;
  }) => (
    <div data-testid="dashboard-layout">
      <h1>{pageTitle}</h1>
      {children}
    </div>
  ),
}));

describe("DashboardInactiveCustomersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-03-11T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders page title", async () => {
    vi.mocked(getCustomersWithPointsForCurrentBusiness).mockResolvedValue([]);

    render(await DashboardInactiveCustomersPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Clientes inactivos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Clientes que no han visitado en los últimos 14 días. Revísalos y vuelve a involucrarlos para aumentar la retención.",
      ),
    ).toBeInTheDocument();
  });

  it("displays no inactive customers message when all customers are active", async () => {
    const customers = [
      {
        id: "cust-1",
        name: "Ana García",
        phone: "555-0001",
        last_visit_at: new Date("2025-03-09T12:00:00Z").toISOString(), // 2 days ago
        points: 50,
      },
      {
        id: "cust-2",
        name: "Luis Pérez",
        phone: "555-0002",
        last_visit_at: new Date("2025-03-05T12:00:00Z").toISOString(), // 6 days ago
        points: 100,
      },
    ];

    vi.mocked(getCustomersWithPointsForCurrentBusiness).mockResolvedValue(
      customers,
    );

    render(await DashboardInactiveCustomersPage());

    expect(
      screen.getByText(
        "No hay clientes inactivos. ¡Todos están comprometidos!",
      ),
    ).toBeInTheDocument();
  });

  it("displays inactive customers in table", async () => {
    const customers = [
      {
        id: "cust-1",
        name: "Luis Pérez",
        phone: "555-0002",
        last_visit_at: new Date("2025-02-25T12:00:00Z").toISOString(), // 14 days ago, inactive
        points: 100,
      },
      {
        id: "cust-2",
        name: "María López",
        phone: "555-0003",
        last_visit_at: null, // Never visited, inactive
        points: 50,
      },
    ];

    vi.mocked(getCustomersWithPointsForCurrentBusiness).mockResolvedValue(
      customers,
    );

    render(await DashboardInactiveCustomersPage());

    // Check table headers
    expect(screen.getByText("Cliente")).toBeInTheDocument();
    expect(screen.getByText("Teléfono")).toBeInTheDocument();
    expect(screen.getByText("Puntos")).toBeInTheDocument();
    expect(screen.getByText("Última Visita")).toBeInTheDocument();
    expect(screen.getByText("Días Inactivo")).toBeInTheDocument();

    // Check table rows
    expect(screen.getByText("Luis Pérez")).toBeInTheDocument();
    expect(screen.getByText("María López")).toBeInTheDocument();
    expect(screen.getByText("555-0002")).toBeInTheDocument();
    expect(screen.getByText("555-0003")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument(); // Luis's points
    expect(screen.getByText("50")).toBeInTheDocument(); // María's points
  });

  it("sorts inactive customers by days since last visit descending", async () => {
    const customers = [
      {
        id: "cust-1",
        name: "Ana García",
        phone: "555-0001",
        last_visit_at: new Date("2025-02-26T12:00:00Z").toISOString(), // 13 days ago, active
        points: 50,
      },
      {
        id: "cust-2",
        name: "Luis Pérez",
        phone: "555-0002",
        last_visit_at: new Date("2025-02-24T12:00:00Z").toISOString(), // 15 days ago
        points: 100,
      },
      {
        id: "cust-3",
        name: "María López",
        phone: "555-0003",
        last_visit_at: null, // treated as most inactive
        points: 75,
      },
      {
        id: "cust-4",
        name: "Carlos Ruiz",
        phone: "555-0004",
        last_visit_at: new Date("2025-02-19T12:00:00Z").toISOString(), // 20 days ago
        points: 90,
      },
    ];

    vi.mocked(getCustomersWithPointsForCurrentBusiness).mockResolvedValue(
      customers,
    );

    render(await DashboardInactiveCustomersPage());

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row").slice(1);

    expect(within(rows[0]).getByText("María López")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Carlos Ruiz")).toBeInTheDocument();
    expect(within(rows[2]).getByText("Luis Pérez")).toBeInTheDocument();
  });

  it("displays error message on failure", async () => {
    const errorMessage = "No se pudieron cargar los clientes.";
    vi.mocked(getCustomersWithPointsForCurrentBusiness).mockRejectedValue(
      new Error(errorMessage),
    );

    render(await DashboardInactiveCustomersPage());

    expect(
      screen.getByText("No se pudieron cargar los clientes inactivos"),
    ).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("displays generic error when thrown error is not Error type", async () => {
    vi.mocked(getCustomersWithPointsForCurrentBusiness).mockRejectedValue(
      "Unexpected error",
    );

    render(await DashboardInactiveCustomersPage());

    expect(
      screen.getByText("No se pudieron cargar los clientes inactivos"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No se pudieron cargar los clientes inactivos."),
    ).toBeInTheDocument();
  });

  it("displays formatted dates in table", async () => {
    const customers = [
      {
        id: "cust-1",
        name: "Test Customer",
        phone: "555-0000",
        last_visit_at: "2025-02-25T12:00:00Z",
        points: 100,
      },
    ];

    vi.mocked(getCustomersWithPointsForCurrentBusiness).mockResolvedValue(
      customers,
    );

    render(await DashboardInactiveCustomersPage());

    // Check that date is formatted as es-ES locale
    expect(screen.getByText("25/2/2025")).toBeInTheDocument();
  });
});
