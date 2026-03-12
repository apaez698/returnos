import { describe, expect, it } from "vitest";
import {
  buildBusinessReactivationSuggestions,
  buildReactivationCampaignSuggestions,
} from "@/lib/campaigns/suggestions";
import type { InactiveCustomer } from "@/lib/customers/inactivity";

function makeInactiveCustomer(
  id: string,
  points: number,
  daysSinceLastVisit: number | null,
): InactiveCustomer {
  return {
    customerId: id,
    name: `Customer ${id}`,
    phone: "555-0000",
    points,
    lastVisitAt: null,
    daysSinceLastVisit,
  };
}

describe("buildReactivationCampaignSuggestions", () => {
  it("returns predefined reactivation suggestions with required fields", () => {
    const suggestions = buildReactivationCampaignSuggestions({
      inactiveCustomers: [],
    });

    expect(suggestions.length).toBeGreaterThanOrEqual(3);

    for (const suggestion of suggestions) {
      expect(suggestion.title.length).toBeGreaterThan(0);
      expect(suggestion.message.length).toBeGreaterThan(0);
      expect(suggestion.audienceType).toBe("inactive_customers");
      expect(suggestion.targetInactiveDays).toBe(14);
      expect(suggestion.campaignType).toBe("reactivation");
    }
  });

  it("uses inactive customer count inside suggestion messages", () => {
    const suggestions = buildReactivationCampaignSuggestions({
      inactiveCustomers: [
        makeInactiveCustomer("1", 10, 20),
        makeInactiveCustomer("2", 80, 30),
        makeInactiveCustomer("3", 5, null),
      ],
    });

    expect(suggestions[0]?.message).toContain("3 clientes");
  });

  it("uses high-value inactive customer count for VIP suggestion", () => {
    const suggestions = buildReactivationCampaignSuggestions({
      inactiveCustomers: [
        makeInactiveCustomer("1", 20, 20),
        makeInactiveCustomer("2", 50, 40),
        makeInactiveCustomer("3", 120, 18),
      ],
    });

    const vipSuggestion = suggestions.find(
      (suggestion) => suggestion.title === "Reactiva clientes con mas puntos",
    );

    expect(vipSuggestion?.message).toContain("2 clientes");
  });

  it("allows custom inactive day target", () => {
    const suggestions = buildReactivationCampaignSuggestions({
      inactiveCustomers: [makeInactiveCustomer("1", 10, 20)],
      targetInactiveDays: 21,
    });

    expect(suggestions.every((s) => s.targetInactiveDays === 21)).toBe(true);
  });
});

describe("buildBusinessReactivationSuggestions", () => {
  it("returns bakery-specific reactivation campaign suggestions", () => {
    const suggestions = buildBusinessReactivationSuggestions({
      businessType: "bakery",
      inactiveCustomerCount: 8,
    });

    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0]?.title).toContain("Dulce");

    for (const suggestion of suggestions) {
      expect(suggestion.message).toContain("8 clientes");
      expect(suggestion.campaignType).toBe("reactivation");
      expect(suggestion.audienceType).toBe("inactive_customers");
      expect(suggestion.targetInactiveDays).toBe(14);
    }
  });

  it("returns restaurant-specific reactivation campaign suggestions", () => {
    const suggestions = buildBusinessReactivationSuggestions({
      businessType: "restaurant",
      inactiveCustomerCount: 5,
      targetInactiveDays: 21,
    });

    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0]?.title).toContain("menu");

    for (const suggestion of suggestions) {
      expect(suggestion.message).toContain("5 clientes");
      expect(suggestion.campaignType).toBe("reactivation");
      expect(suggestion.audienceType).toBe("inactive_customers");
      expect(suggestion.targetInactiveDays).toBe(21);
    }
  });

  it("returns an empty array when there are no inactive customers", () => {
    const suggestions = buildBusinessReactivationSuggestions({
      businessType: "bakery",
      inactiveCustomerCount: 0,
    });

    expect(suggestions).toEqual([]);
  });
});
