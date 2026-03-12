import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AppShell } from "@/components/shell/app-shell";

// ---------------------------------------------------------------------------
// Mock client-side hooks used by LogoutButton
// ---------------------------------------------------------------------------

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock("@/lib/supabase/client", () => ({
  createBrowserClient: vi.fn(() => ({
    auth: { signOut: vi.fn().mockResolvedValue({}) },
  })),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_PROPS = {
  businessName: "Panadería La Esperanza",
  businessType: "bakery",
  userEmail: "owner@panaderia.mx",
};

function renderShell(props = DEFAULT_PROPS) {
  return render(
    <AppShell {...props}>
      <div data-testid="page-content">Contenido de página</div>
    </AppShell>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AppShell — authenticated shell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("business branding", () => {
    it("displays the current business name in the sidebar", () => {
      renderShell();
      expect(screen.getByText("Panadería La Esperanza")).toBeInTheDocument();
    });

    it("displays the business type label in the sidebar", () => {
      renderShell();
      expect(screen.getByText("Panadería / Cafetería")).toBeInTheDocument();
    });

    it("displays 'Restaurante' label for restaurant type", () => {
      renderShell({ ...DEFAULT_PROPS, businessType: "restaurant" });
      expect(screen.getByText("Restaurante")).toBeInTheDocument();
    });

    it("falls back to raw type value when type is unknown", () => {
      renderShell({ ...DEFAULT_PROPS, businessType: "café" });
      expect(screen.getByText("café")).toBeInTheDocument();
    });
  });

  describe("user menu", () => {
    it("displays the authenticated user email", () => {
      renderShell();
      expect(screen.getByText("owner@panaderia.mx")).toBeInTheDocument();
    });

    it("renders a logout button", () => {
      renderShell();
      expect(
        screen.getByRole("button", { name: /cerrar sesión/i }),
      ).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("renders main navigation landmark", () => {
      renderShell();
      expect(
        screen.getByRole("navigation", { name: /navegación principal/i }),
      ).toBeInTheDocument();
    });

    it("renders dashboard link", () => {
      renderShell();
      expect(
        screen.getByRole("link", { name: /dashboard/i }),
      ).toBeInTheDocument();
    });

    it("renders clientes link", () => {
      renderShell();
      expect(
        screen.getByRole("link", { name: /clientes/i }),
      ).toBeInTheDocument();
    });

    it("renders caja link", () => {
      renderShell();
      expect(screen.getByRole("link", { name: /caja/i })).toBeInTheDocument();
    });

    it("renders recompensas link", () => {
      renderShell();
      expect(
        screen.getByRole("link", { name: /recompensas/i }),
      ).toBeInTheDocument();
    });

    it("renders campañas link", () => {
      renderShell();
      expect(
        screen.getByRole("link", { name: /campañas/i }),
      ).toBeInTheDocument();
    });

    it("all nav links point to /dashboard/* routes", () => {
      renderShell();
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link.getAttribute("href")).toMatch(/^\/dashboard/);
      });
    });
  });

  describe("content area", () => {
    it("renders page content inside the shell", () => {
      renderShell();
      expect(screen.getByTestId("page-content")).toBeInTheDocument();
    });

    it("renders content from children prop", () => {
      render(
        <AppShell {...DEFAULT_PROPS}>
          <h1>Resumen del negocio</h1>
        </AppShell>,
      );
      expect(
        screen.getByRole("heading", { name: "Resumen del negocio" }),
      ).toBeInTheDocument();
    });
  });
});
