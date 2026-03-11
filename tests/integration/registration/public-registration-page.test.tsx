import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { getBusinessBySlug } from "@/lib/businesses/queries";
import RegistrationPage from "@/app/r/[slug]/page";

vi.mock("@/lib/businesses/queries", () => ({
  getBusinessBySlug: vi.fn(),
}));

vi.mock("@/app/r/[slug]/actions", () => ({
  registerPublicCustomerAction: vi.fn(),
}));

// Stub the form so page-level tests stay focused on routing/data logic
vi.mock("@/components/registration/public-registration-form", () => ({
  PublicRegistrationForm: ({ businessName }: { businessName: string }) => (
    <div data-testid="registration-form">Form for {businessName}</div>
  ),
}));

const MOCK_BUSINESS = {
  id: "biz-1",
  name: "Cafetería El Roble",
  slug: "cafeteria-el-roble",
  business_type: "restaurant" as const,
  created_at: "2024-01-01T00:00:00Z",
};

async function renderPage(slug: string) {
  const jsx = await RegistrationPage({ params: Promise.resolve({ slug }) });
  render(jsx);
}

describe("RegistrationPage (/r/[slug])", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when the business exists", () => {
    beforeEach(() => {
      vi.mocked(getBusinessBySlug).mockResolvedValue(MOCK_BUSINESS);
    });

    it("fetches the business using the slug from the URL", async () => {
      await renderPage("cafeteria-el-roble");

      expect(vi.mocked(getBusinessBySlug)).toHaveBeenCalledWith(
        "cafeteria-el-roble",
      );
    });

    it("displays the business name as the page heading", async () => {
      await renderPage("cafeteria-el-roble");

      expect(
        screen.getByRole("heading", { name: MOCK_BUSINESS.name }),
      ).toBeInTheDocument();
    });

    it("renders the registration form", async () => {
      await renderPage("cafeteria-el-roble");

      expect(screen.getByTestId("registration-form")).toBeInTheDocument();
    });

    it("does not render the not-found message", async () => {
      await renderPage("cafeteria-el-roble");

      expect(
        screen.queryByRole("heading", { name: /página no encontrada/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("when the business does not exist", () => {
    beforeEach(() => {
      vi.mocked(getBusinessBySlug).mockResolvedValue(null);
    });

    it("renders a not-found heading", async () => {
      await renderPage("unknown-slug");

      expect(
        screen.getByRole("heading", { name: /página no encontrada/i }),
      ).toBeInTheDocument();
    });

    it("renders a message directing the user to ask for the correct link", async () => {
      await renderPage("unknown-slug");

      expect(screen.getByText(/negocio registrado/i)).toBeInTheDocument();
    });

    it("does not render the registration form", async () => {
      await renderPage("unknown-slug");

      expect(screen.queryByTestId("registration-form")).not.toBeInTheDocument();
    });
  });
});
