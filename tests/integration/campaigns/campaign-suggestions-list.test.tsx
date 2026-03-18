import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CampaignSuggestionsList } from "@/components/campaigns/campaign-suggestions-list";
import type { CampaignSuggestion } from "@/lib/campaigns/types";

const suggestions: CampaignSuggestion[] = [
  {
    title: "Regreso dulce",
    message: "Vuelve esta semana y te damos cafe.",
    audienceType: "inactive_customers",
    targetInactiveDays: 14,
    campaignType: "reactivation",
  },
  {
    title: "Vuelve al almuerzo",
    message: "Regresa y recibe 10% de descuento.",
    audienceType: "inactive_customers",
    targetInactiveDays: 30,
    campaignType: "reactivation",
  },
];

function renderList(
  overrides: Partial<{
    suggestions: CampaignSuggestion[];
    onSelectSuggestion: ReturnType<typeof vi.fn>;
    onCreateSuggestion: ReturnType<typeof vi.fn>;
    isCreatingSuggestion: boolean;
  }> = {},
) {
  const props = {
    suggestions,
    onSelectSuggestion: vi.fn(),
    onCreateSuggestion: vi.fn(),
    isCreatingSuggestion: false,
    ...overrides,
  };
  render(<CampaignSuggestionsList {...props} />);
  return props;
}

describe("CampaignSuggestionsList", () => {
  describe("when suggestions exist", () => {
    it("renders the section heading and description", () => {
      renderList();

      expect(
        screen.getByRole("heading", { name: /sugerencias de reactivacion/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/elige una propuesta/i)).toBeInTheDocument();
    });

    it("renders a card for each suggestion with title and message", () => {
      renderList();

      expect(screen.getByText("Regreso dulce")).toBeInTheDocument();
      expect(
        screen.getByText("Vuelve esta semana y te damos cafe."),
      ).toBeInTheDocument();

      expect(screen.getByText("Vuelve al almuerzo")).toBeInTheDocument();
      expect(
        screen.getByText("Regresa y recibe 10% de descuento."),
      ).toBeInTheDocument();
    });

    it("renders audience and inactivity badges on each card", () => {
      renderList();

      const cards = screen.getAllByRole("article");
      expect(cards).toHaveLength(2);

      const firstCard = cards[0];
      expect(
        within(firstCard).getByText(/clientes inactivos/i),
      ).toBeInTheDocument();
      expect(within(firstCard).getByText(/14\+ d.as/i)).toBeInTheDocument();

      const secondCard = cards[1];
      expect(
        within(secondCard).getByText(/clientes inactivos/i),
      ).toBeInTheDocument();
      expect(within(secondCard).getByText(/30\+ d.as/i)).toBeInTheDocument();
    });

    it("selects the first suggestion by default", () => {
      renderList();

      const cards = screen.getAllByRole("article");
      expect(
        within(cards[0]).getByRole("button", {
          name: /sugerencia seleccionada/i,
        }),
      ).toBeInTheDocument();
      expect(
        within(cards[1]).getByRole("button", { name: /usar sugerencia/i }),
      ).toBeInTheDocument();
    });

    it("calls onSelectSuggestion with the correct suggestion when 'Use suggestion' is clicked", async () => {
      const user = userEvent.setup();
      const { onSelectSuggestion } = renderList();

      const cards = screen.getAllByRole("article");
      await user.click(
        within(cards[1]).getByRole("button", { name: /usar sugerencia/i }),
      );

      expect(onSelectSuggestion).toHaveBeenCalledTimes(1);
      expect(onSelectSuggestion).toHaveBeenCalledWith(suggestions[1]);
    });

    it("updates the selected card after clicking 'Use suggestion'", async () => {
      const user = userEvent.setup();
      renderList();

      const cards = screen.getAllByRole("article");
      await user.click(
        within(cards[1]).getByRole("button", { name: /usar sugerencia/i }),
      );

      expect(
        within(cards[1]).getByRole("button", { name: /sugerencia seleccionada/i }),
      ).toBeInTheDocument();
      expect(
        within(cards[0]).getByRole("button", { name: /usar sugerencia/i }),
      ).toBeInTheDocument();
    });

    it("calls onCreateSuggestion with the correct suggestion when 'Crear desde sugerencia' is clicked", async () => {
      const user = userEvent.setup();
      const { onCreateSuggestion } = renderList();

      const cards = screen.getAllByRole("article");
      await user.click(
        within(cards[0]).getByRole("button", {
          name: /crear desde sugerencia/i,
        }),
      );

      expect(onCreateSuggestion).toHaveBeenCalledTimes(1);
      expect(onCreateSuggestion).toHaveBeenCalledWith(suggestions[0]);
    });

    it("shows 'Creando...' and disables create buttons while isCreatingSuggestion is true", () => {
      renderList({ isCreatingSuggestion: true });

      const createButtons = screen.getAllByRole("button", { name: /creando/i });
      expect(createButtons).toHaveLength(2);
      createButtons.forEach((btn) => expect(btn).toBeDisabled());
    });
  });

  describe("when there are no suggestions", () => {
    it("renders the empty state message", () => {
      renderList({ suggestions: [] });

      expect(
        screen.getByText(/no hay sugerencias disponibles/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/agrega clientes inactivos/i),
      ).toBeInTheDocument();
    });

    it("does not render any suggestion cards", () => {
      renderList({ suggestions: [] });

      expect(screen.queryAllByRole("article")).toHaveLength(0);
    });
  });
});
