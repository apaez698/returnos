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
        name: "Fidelizacion para restaurantes que aumenta clientes recurrentes",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Tarjetas de puntos digitales" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Campanas automaticas de reactivacion",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Analitica de negocio en tiempo real",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Comenzar prueba gratis" }),
    ).toHaveAttribute("href", "/login");
    expect(
      screen.getByRole("link", { name: "Ver demo del dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
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
