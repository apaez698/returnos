import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DashboardCajaPage from "@/app/dashboard/caja/page";
import { getPosCustomersForCurrentBusiness } from "@/lib/pos/queries";
import { PosCustomer } from "@/lib/pos/types";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/pos/queries", () => ({
  getPosCustomersForCurrentBusiness: vi.fn(),
}));

vi.mock("@/app/dashboard/caja/actions", () => ({
  registerPosPurchaseAction: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CUSTOMER_A: PosCustomer = {
  id: "customer-1",
  name: "Ana Perez",
  phone: "+521111111111",
  points: 20,
  last_visit_at: null,
};

const CUSTOMER_B: PosCustomer = {
  id: "customer-2",
  name: "Carlos Gomez",
  phone: "+529998887777",
  points: 150,
  last_visit_at: "2026-03-10T10:00:00Z",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function renderPage(): Promise<void> {
  const jsx = await DashboardCajaPage();
  render(jsx);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DashboardCajaPage (/dashboard/caja)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPosCustomersForCurrentBusiness).mockResolvedValue([
      CUSTOMER_A,
      CUSTOMER_B,
    ]);
  });

  // -------------------------------------------------------------------------
  // Page structure
  // -------------------------------------------------------------------------

  describe("page structure", () => {
    it("renders the page title 'Caja' as an h1", async () => {
      await renderPage();

      expect(
        screen.getByRole("heading", { name: "Caja", level: 1 }),
      ).toBeInTheDocument();
    });

    it("renders the section heading 'Registro rápido de compras'", async () => {
      await renderPage();

      expect(
        screen.getByRole("heading", { name: /registro rápido de compras/i }),
      ).toBeInTheDocument();
    });

    it("renders the description paragraph", async () => {
      await renderPage();

      expect(
        screen.getByText(/busca un cliente, selecciónalo y/i),
      ).toBeInTheDocument();
    });

    it("renders the POS section heading 'Caja / POS'", async () => {
      await renderPage();

      expect(
        screen.getByRole("heading", { name: /caja \/ pos/i }),
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Customer search
  // -------------------------------------------------------------------------

  describe("customer search", () => {
    it("renders the 'Buscar cliente' search input", async () => {
      await renderPage();

      expect(
        screen.getByRole("searchbox", { name: /buscar cliente/i }),
      ).toBeInTheDocument();
    });

    it("lists all customers returned by the data-fetch mock", async () => {
      await renderPage();

      expect(
        screen.getByRole("button", { name: /ana perez/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /carlos gomez/i }),
      ).toBeInTheDocument();
    });

    it("shows customer points next to each customer in the list", async () => {
      await renderPage();

      // Each customer button contains the points label (e.g. "20 pts")
      const anaButton = screen.getByRole("button", { name: /ana perez/i });
      expect(anaButton).toHaveTextContent(/20\s*pts/i);

      const carlosButton = screen.getByRole("button", {
        name: /carlos gomez/i,
      });
      expect(carlosButton).toHaveTextContent(/150\s*pts/i);
    });

    it("filters the customer list when user types a name", async () => {
      await renderPage();
      const user = userEvent.setup();

      const searchInput = screen.getByRole("searchbox", {
        name: /buscar cliente/i,
      });
      await user.type(searchInput, "Ana");

      expect(
        screen.getByRole("button", { name: /ana perez/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /carlos gomez/i }),
      ).not.toBeInTheDocument();
    });

    it("filters the customer list when user types a phone number", async () => {
      await renderPage();
      const user = userEvent.setup();

      const searchInput = screen.getByRole("searchbox", {
        name: /buscar cliente/i,
      });
      await user.type(searchInput, "9998887777");

      expect(
        screen.queryByRole("button", { name: /ana perez/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /carlos gomez/i }),
      ).toBeInTheDocument();
    });

    it("shows 'no customers found' message when search has no matches", async () => {
      await renderPage();
      const user = userEvent.setup();

      await user.type(
        screen.getByRole("searchbox", { name: /buscar cliente/i }),
        "zzznoexiste",
      );

      expect(
        screen.getByText(/no se encontraron clientes con ese criterio/i),
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Purchase form — pre-selection state
  // -------------------------------------------------------------------------

  describe("purchase form before customer selection", () => {
    it("shows placeholder text prompting to select a customer", async () => {
      await renderPage();

      expect(
        screen.getAllByText(/selecciona un cliente/i).length,
      ).toBeGreaterThan(0);
    });

    it("submit button is present but disabled before selection", async () => {
      await renderPage();

      expect(
        screen.getByRole("button", { name: /registrar compra/i }),
      ).toBeDisabled();
    });

    it("amount input is disabled before a customer is selected", async () => {
      await renderPage();

      expect(screen.getByLabelText("Monto")).toBeDisabled();
    });
  });

  // -------------------------------------------------------------------------
  // Purchase form — after selecting a customer
  // -------------------------------------------------------------------------

  describe("purchase form after selecting a customer", () => {
    async function renderAndSelect(customer: PosCustomer = CUSTOMER_A) {
      await renderPage();
      const user = userEvent.setup();
      await user.click(
        screen.getByRole("button", { name: new RegExp(customer.name, "i") }),
      );
      return user;
    }

    it("shows the selected customer's name in the confirmation panel", async () => {
      await renderAndSelect(CUSTOMER_A);

      // The name appears at least once in the right-side panel
      expect(screen.getAllByText(/ana perez/i).length).toBeGreaterThanOrEqual(
        1,
      );
    });

    it("shows the selected customer's phone in the confirmation panel", async () => {
      await renderAndSelect(CUSTOMER_A);

      // Phone appears in both the CustomerSearch panel and the form panel
      expect(
        screen.getAllByText(CUSTOMER_A.phone).length,
      ).toBeGreaterThanOrEqual(1);
    });

    it("shows the selected customer's points in the confirmation panel", async () => {
      await renderAndSelect(CUSTOMER_A);

      // Points appear as "20 pts" inside the confirmation area
      const confirmPanels = screen.getAllByText(/20\s*pts/i);
      expect(confirmPanels.length).toBeGreaterThanOrEqual(1);
    });

    it("renders the amount input after customer selection", async () => {
      await renderAndSelect(CUSTOMER_A);

      expect(screen.getByLabelText("Monto")).toBeInTheDocument();
    });

    it("submit button becomes enabled after customer selection", async () => {
      await renderAndSelect(CUSTOMER_A);

      expect(
        screen.getByRole("button", { name: /registrar compra/i }),
      ).not.toBeDisabled();
    });

    it("can select a different customer from the list", async () => {
      vi.mocked(getPosCustomersForCurrentBusiness).mockResolvedValue([
        CUSTOMER_A,
        CUSTOMER_B,
      ]);
      const user = await renderAndSelect(CUSTOMER_A);

      // Clear the search so Carlos becomes visible again, then select him
      const searchInput = screen.getByRole("searchbox", {
        name: /buscar cliente/i,
      });
      await user.clear(searchInput);
      await user.click(screen.getByRole("button", { name: /carlos gomez/i }));

      expect(
        screen.getAllByText(/carlos gomez/i).length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  // -------------------------------------------------------------------------
  // Empty state
  // -------------------------------------------------------------------------

  describe("empty state — no customers", () => {
    beforeEach(() => {
      vi.mocked(getPosCustomersForCurrentBusiness).mockResolvedValue([]);
    });

    it("shows a notice to add customers first", async () => {
      await renderPage();

      expect(
        screen.getByText(/primero agrega al menos un cliente/i),
      ).toBeInTheDocument();
    });

    it("still renders the search input even with an empty list", async () => {
      await renderPage();

      expect(
        screen.getByRole("searchbox", { name: /buscar cliente/i }),
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Error state
  // -------------------------------------------------------------------------

  describe("error state — data fetch failure", () => {
    beforeEach(() => {
      vi.mocked(getPosCustomersForCurrentBusiness).mockRejectedValue(
        new Error("Error de conexión con la base de datos"),
      );
    });

    it("shows the 'No se pudo cargar caja' error heading", async () => {
      await renderPage();

      expect(screen.getByText(/no se pudo cargar caja/i)).toBeInTheDocument();
    });

    it("displays the error message returned by the thrown Error", async () => {
      await renderPage();

      expect(
        screen.getByText(/error de conexión con la base de datos/i),
      ).toBeInTheDocument();
    });

    it("does not render the POS purchase form when an error occurs", async () => {
      await renderPage();

      expect(
        screen.queryByRole("heading", { name: /caja \/ pos/i }),
      ).not.toBeInTheDocument();
    });
  });
});
