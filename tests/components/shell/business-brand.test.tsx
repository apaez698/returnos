import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BusinessBrand } from "@/components/shell/business-brand";

vi.mock("@/lib/business/business-branding", () => ({
  getBusinessTypeLabel: vi.fn((type: string) => {
    const labels: Record<string, string> = {
      bakery: "Panadería / Cafetería",
      restaurant: "Restaurante",
    };
    return labels[type] ?? type;
  }),
}));

describe("BusinessBrand", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders business name and type label", () => {
    render(
      <BusinessBrand
        name="Panadería La Esperanza"
        type="bakery"
        logoUrl={null}
      />,
    );

    expect(screen.getByText("Panadería La Esperanza")).toBeInTheDocument();
    expect(screen.getByText("Panadería / Cafetería")).toBeInTheDocument();
  });

  it("displays logo image when logoUrl is provided", () => {
    render(
      <BusinessBrand
        name="El Buen Comer"
        type="restaurant"
        logoUrl="https://example.com/logo.png"
      />,
    );

    const img = screen.getByAltText("El Buen Comer");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/logo.png");
    expect(img).toHaveClass("w-10", "h-10", "rounded-lg");
  });

  it("displays initials avatar when logo is missing", () => {
    render(<BusinessBrand name="Café Moderno" type="bakery" logoUrl={null} />);

    const avatar = screen.getByText("C");
    expect(avatar).toBeInTheDocument();
    expect(avatar.parentElement).toHaveClass("bg-indigo-500");
  });

  it("displays correct initial from business name", () => {
    render(<BusinessBrand name="Restaurante Único" type="restaurant" />);

    expect(screen.getByText("R")).toBeInTheDocument();
  });

  it("displays initials avatar when logoUrl is undefined", () => {
    render(
      <BusinessBrand name="test Business" type="bakery" logoUrl={undefined} />,
    );

    const avatar = screen.getByText("T");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass("text-white", "font-bold");
  });

  it("uses businessTypeLabel helper for type display", () => {
    render(
      <BusinessBrand name="Test Restaurant" type="restaurant" logoUrl={null} />,
    );

    expect(screen.getByText("Restaurante")).toBeInTheDocument();
  });

  it("handles special characters in business name", () => {
    render(
      <BusinessBrand
        name="Café & Panadería 'Artesanal'"
        type="bakery"
        logoUrl={null}
      />,
    );

    expect(
      screen.getByText("Café & Panadería 'Artesanal'"),
    ).toBeInTheDocument();
    const avatar = screen.getByText("C");
    expect(avatar).toBeInTheDocument();
  });

  it("truncates long business names", () => {
    const { container } = render(
      <BusinessBrand
        name="This is a very very long business name that should be truncated"
        type="bakery"
        logoUrl={null}
      />,
    );

    const nameElement = screen.getByText(
      "This is a very very long business name that should be truncated",
    );
    expect(nameElement).toHaveClass("truncate");
  });

  it("applies correct styling classes to logo image", () => {
    render(
      <BusinessBrand
        name="Styled Business"
        type="bakery"
        logoUrl="https://example.com/logo.png"
      />,
    );

    const img = screen.getByAltText("Styled Business");
    expect(img).toHaveClass(
      "w-10",
      "h-10",
      "rounded-lg",
      "object-cover",
      "flex-shrink-0",
    );
  });

  it("renders aria-hidden on avatar div", () => {
    const { container } = render(
      <BusinessBrand name="Aria Test" type="bakery" logoUrl={null} />,
    );

    const avatarDiv = container.querySelector('[aria-hidden="true"]');
    expect(avatarDiv).toBeInTheDocument();
    expect(avatarDiv).toHaveClass("bg-indigo-500");
  });
});
