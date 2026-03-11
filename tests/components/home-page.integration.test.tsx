import { render, screen } from "@testing-library/react";

import HomePage from "@/app/page";

describe("HomePage integration", () => {
  it("renders expected headings and CTA buttons", () => {
    render(<HomePage />);

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
});
