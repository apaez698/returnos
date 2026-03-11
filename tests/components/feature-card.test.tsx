import { render, screen } from "@testing-library/react";

import { FeatureCard } from "@/components/landing/feature-card";

describe("FeatureCard", () => {
  it("renders title and description", () => {
    render(
      <FeatureCard
        title="Campanas automaticas de reactivacion"
        description="Recupera clientes inactivos con ofertas personalizadas."
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Campanas automaticas de reactivacion",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Recupera clientes inactivos con ofertas personalizadas."),
    ).toBeInTheDocument();
  });
});