import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AppShell } from "@/components/shell/app-shell";

// ---------------------------------------------------------------------------
// Mock client-side hooks used by LogoutButton
// ---------------------------------------------------------------------------

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => "/dashboard"),
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

  describe("business logo handling", () => {
    it("displays business logo when logoUrl is provided", () => {
      render(
        <AppShell
          {...DEFAULT_PROPS}
          businessLogoUrl="https://example.com/logo.png"
        >
          <div data-testid="page-content">Content</div>
        </AppShell>,
      );

      const logo = screen.getByAltText("Panadería La Esperanza");
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute("src", "https://example.com/logo.png");
    });

    it("displays initial avatar when logoUrl is null", () => {
      render(
        <AppShell {...DEFAULT_PROPS} businessLogoUrl={null}>
          <div data-testid="page-content">Content</div>
        </AppShell>,
      );

      const avatar = screen.getByText("P");
      expect(avatar).toBeInTheDocument();
      expect(avatar.parentElement).toHaveClass("bg-indigo-500");
    });

    it("displays initial avatar when logoUrl is undefined", () => {
      render(
        <AppShell {...DEFAULT_PROPS} businessLogoUrl={undefined}>
          <div data-testid="page-content">Content</div>
        </AppShell>,
      );

      const avatar = screen.getByText("P");
      expect(avatar).toBeInTheDocument();
    });

    it("uses first character of business name for avatar initial", () => {
      render(
        <AppShell
          businessName="Café Moderno"
          businessType="bakery"
          userEmail="user@example.com"
          businessLogoUrl={null}
        >
          <div data-testid="page-content">Content</div>
        </AppShell>,
      );

      const avatar = screen.getByText("C");
      expect(avatar).toBeInTheDocument();
    });
  });

  describe("user role information", () => {
    it("displays owner role label", () => {
      render(
        <AppShell {...DEFAULT_PROPS} userRole="owner">
          <div data-testid="page-content">Content</div>
        </AppShell>,
      );

      expect(screen.getByText("Propietario")).toBeInTheDocument();
    });

    it("displays admin role label", () => {
      render(
        <AppShell {...DEFAULT_PROPS} userRole="admin">
          <div data-testid="page-content">Content</div>
        </AppShell>,
      );

      expect(screen.getByText("Administrador")).toBeInTheDocument();
    });

    it("displays staff role label", () => {
      render(
        <AppShell {...DEFAULT_PROPS} userRole="staff">
          <div data-testid="page-content">Content</div>
        </AppShell>,
      );

      expect(screen.getByText("Colaborador")).toBeInTheDocument();
    });

    it("does not display role when role is null", () => {
      render(
        <AppShell {...DEFAULT_PROPS} userRole={null}>
          <div data-testid="page-content">Content</div>
        </AppShell>,
      );

      expect(screen.queryByText("Propietario")).not.toBeInTheDocument();
      expect(screen.queryByText("Administrador")).not.toBeInTheDocument();
    });

    it("does not display role when role is undefined", () => {
      render(
        <AppShell {...DEFAULT_PROPS} userRole={undefined}>
          <div data-testid="page-content">Content</div>
        </AppShell>,
      );

      expect(screen.queryByText("Propietario")).not.toBeInTheDocument();
    });
  });

  describe("complete business context resolution", () => {
    it("renders all business context information together", () => {
      render(
        <AppShell
          businessName="El Buen Comer"
          businessType="restaurant"
          businessLogoUrl="https://example.com/restaurant-logo.png"
          userEmail="admin@restaurante.mx"
          userRole="admin"
        >
          <div data-testid="page-content">Resumen</div>
        </AppShell>,
      );

      // Business context
      expect(screen.getByText("El Buen Comer")).toBeInTheDocument();
      expect(screen.getByText("Restaurante")).toBeInTheDocument();

      // User context
      expect(screen.getByText("admin@restaurante.mx")).toBeInTheDocument();
      expect(screen.getByText("Administrador")).toBeInTheDocument();

      // Logo
      const logo = screen.getByAltText("El Buen Comer");
      expect(logo).toHaveAttribute(
        "src",
        "https://example.com/restaurant-logo.png",
      );

      // Content
      expect(screen.getByTestId("page-content")).toBeInTheDocument();
    });

    it("renders with missing logo but complete user and business info", () => {
      render(
        <AppShell
          businessName="Panadería Express"
          businessType="bakery"
          businessLogoUrl={null}
          userEmail="staff@panderia.mx"
          userRole="staff"
        >
          <div data-testid="page-content">Panel</div>
        </AppShell>,
      );

      // Business name and type present
      expect(screen.getByText("Panadería Express")).toBeInTheDocument();
      expect(screen.getByText("Panadería / Cafetería")).toBeInTheDocument();

      // Use default avatar for missing logo
      expect(screen.getByText("P")).toBeInTheDocument();

      // User info present
      expect(screen.getByText("staff@panderia.mx")).toBeInTheDocument();
      expect(screen.getByText("Colaborador")).toBeInTheDocument();
    });
  });

  describe("invalid context handling", () => {
    it("renders shell with empty business name", () => {
      render(
        <AppShell
          businessName=""
          businessType="bakery"
          userEmail="user@example.com"
          businessLogoUrl={null}
          userRole={null}
        >
          <div data-testid="page-content">Content</div>
        </AppShell>,
      );

      expect(screen.getByTestId("page-content")).toBeInTheDocument();
    });

    it("renders shell with unknown business type", () => {
      render(
        <AppShell
          businessName="Negocio Nuevo"
          businessType="unknown-type"
          userEmail="user@example.com"
          businessLogoUrl={null}
        >
          <div data-testid="page-content">Content</div>
        </AppShell>,
      );

      // Falls back to raw type for unknown types
      expect(screen.getByText("unknown-type")).toBeInTheDocument();
    });

    it("handles very long business name gracefully", () => {
      const longName =
        "Esta es una panadería con un nombre muy muy largo que excede el espacio normal";
      render(
        <AppShell
          businessName={longName}
          businessType="bakery"
          userEmail="user@example.com"
          businessLogoUrl={null}
        >
          <div data-testid="page-content">Content</div>
        </AppShell>,
      );

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it("handles very long email address gracefully", () => {
      const longEmail =
        "very.long.email.with.many.parts@subdomain.example.restaurant.com";
      render(
        <AppShell
          businessName="Business"
          businessType="restaurant"
          userEmail={longEmail}
          businessLogoUrl={null}
        >
          <div data-testid="page-content">Content</div>
        </AppShell>,
      );

      expect(screen.getByText(longEmail)).toBeInTheDocument();
    });

    it("renders shell with special characters in business name", () => {
      render(
        <AppShell
          businessName="Café & Panadería 'Artesanal'"
          businessType="bakery"
          userEmail="owner@example.com"
          businessLogoUrl={null}
          userRole="owner"
        >
          <div data-testid="page-content">Content</div>
        </AppShell>,
      );

      expect(
        screen.getByText("Café & Panadería 'Artesanal'"),
      ).toBeInTheDocument();
      expect(screen.getByText("Propietario")).toBeInTheDocument();
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
