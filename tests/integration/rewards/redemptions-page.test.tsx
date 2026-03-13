import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RedemptionsPageClient from "@/app/dashboard/rewards/redemptions/page-client";
import type { RedemptionItem } from "@/lib/rewards/redemptions-types";

const MOCK_REDEMPTIONS: RedemptionItem[] = [
  {
    id: "red-1",
    customer_id: "cus-1",
    customer_name: "Ana Garcia",
    customer_phone: "555-1111",
    reward_id: "rule-1",
    reward_name: "Cafe gratis",
    reward_description: "1 pieza",
    points_spent: 100,
    redeemed_at: "2026-03-10T12:00:00.000Z",
    created_at: "2026-03-10T12:00:00.000Z",
  },
  {
    id: "red-2",
    customer_id: "cus-2",
    customer_name: "Luis Perez",
    customer_phone: "555-2222",
    reward_id: "rule-2",
    reward_name: "Pan dulce",
    reward_description: "2 piezas",
    points_spent: 200,
    redeemed_at: "2026-03-12T12:00:00.000Z",
    created_at: "2026-03-12T12:00:00.000Z",
  },
  {
    id: "red-3",
    customer_id: "cus-3",
    customer_name: "Maria Lopez",
    customer_phone: "555-3333",
    reward_id: "rule-3",
    reward_name: "Descuento 10%",
    reward_description: "Aplicable en compra",
    points_spent: 150,
    redeemed_at: "2026-03-15T12:00:00.000Z",
    created_at: "2026-03-15T12:00:00.000Z",
  },
];

function renderPage(redemptions: RedemptionItem[] = MOCK_REDEMPTIONS) {
  render(<RedemptionsPageClient initialRedemptions={redemptions} />);
}

describe("RedemptionsPageClient (/dashboard/rewards/redemptions)", () => {
  it("renders redemption rows with customer and reward data", () => {
    renderPage();

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");

    expect(rows).toHaveLength(4);
    expect(within(table).getByText("Ana Garcia")).toBeInTheDocument();
    expect(within(table).getByText("Luis Perez")).toBeInTheDocument();
    expect(within(table).getByText("Cafe gratis")).toBeInTheDocument();
    expect(within(table).getByText("200 pts")).toBeInTheDocument();
    expect(screen.getByText("3 de 3")).toBeInTheDocument();
  });

  it("filters by customer search using name and phone", async () => {
    const user = userEvent.setup();
    renderPage();

    const searchInput = screen.getByPlaceholderText("Nombre o teléfono...");
    await user.type(searchInput, "555-2222");
    await user.click(screen.getByRole("button", { name: /aplicar filtros/i }));

    const table = screen.getByRole("table");
    expect(within(table).getByText("Luis Perez")).toBeInTheDocument();
    expect(within(table).queryByText("Ana Garcia")).not.toBeInTheDocument();
    expect(within(table).queryByText("Maria Lopez")).not.toBeInTheDocument();
    expect(screen.getByText("1 de 3")).toBeInTheDocument();
  });

  it("filters by date range inclusively", async () => {
    const user = userEvent.setup();
    renderPage();

    const dateInputs =
      document.querySelectorAll<HTMLInputElement>('input[type="date"]');

    await user.type(dateInputs[0], "2026-03-12");
    await user.type(dateInputs[1], "2026-03-13");
    await user.click(screen.getByRole("button", { name: /aplicar filtros/i }));

    const table = screen.getByRole("table");
    expect(within(table).getByText("Luis Perez")).toBeInTheDocument();
    expect(within(table).queryByText("Ana Garcia")).not.toBeInTheDocument();
    expect(within(table).queryByText("Maria Lopez")).not.toBeInTheDocument();
    expect(screen.getByText("1 de 3")).toBeInTheDocument();
  });

  it("renders empty state when there are no redemptions", () => {
    renderPage([]);

    expect(screen.getByText("Sin canjes aún")).toBeInTheDocument();
    expect(
      screen.getByText(/no hay canjes de recompensas registrados/i),
    ).toBeInTheDocument();
    expect(screen.getByText("0 de 0")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
