import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import HomePage from "@/app/page";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { redirect } from "next/navigation";

vi.mock("@/lib/auth/get-current-user", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

describe("HomePage integration", () => {
  it("renders expected headings and CTA buttons", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    render(await HomePage());

    expect(
      screen.getByRole("heading", {
        name: /convierte clientes ocasionales en clientes recurrentes/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Tarjetas de puntos digitales" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Campañas automáticas de reactivación",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Analítica de negocio en tiempo real",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Empieza gratis en 2 minutos" }),
    ).toHaveAttribute("href", "/signup");

    const loginLinks = screen.getAllByRole("link", {
      name: "Iniciar sesión",
    });
    expect(loginLinks.length).toBeGreaterThan(0);
    expect(
      loginLinks.some((link) => link.getAttribute("href") === "/login"),
    ).toBe(true);
  });

  it("redirects to dashboard when there is an authenticated user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      email: "owner@bakery.com",
    });

    await expect(HomePage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });
});
