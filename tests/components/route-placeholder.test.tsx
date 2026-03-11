import { render, screen } from "@testing-library/react";

import { RoutePlaceholder } from "@/components/placeholders/route-placeholder";

describe("RoutePlaceholder", () => {
  it("renders title and description", () => {
    render(<RoutePlaceholder title="Dashboard" description="Overview" />);

    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
  });
});
