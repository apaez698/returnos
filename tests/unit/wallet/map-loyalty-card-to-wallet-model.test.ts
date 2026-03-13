import type { LoyaltyCardViewModel } from "@/features/loyalty-card/types/loyalty-card-types";
import { mapLoyaltyCardToWalletModel } from "@/features/wallet/shared/map-loyalty-card-to-wallet-model";

function makeCard(
  overrides?: Partial<LoyaltyCardViewModel>,
): LoyaltyCardViewModel {
  return {
    business: {
      id: "biz-1",
      name: "Panaderia Aurora",
      slug: "panaderia-aurora",
      business_type: "bakery",
    },
    customer: {
      id: "customer-1",
      name: "Ada Lovelace",
      phone: "+5215512345678",
    },
    loyalty: {
      status: "in_progress",
      current_points: 42,
      reward_target_points: 50,
      progress_percentage_to_target: 84,
      remaining_points_to_target: 8,
      redeemable_reward: null,
      next_reward: {
        id: "reward-1",
        name: "Cafe gratis",
        points_required: 50,
        reward_description: "1 cafe americano",
      },
    },
    ...overrides,
  };
}

describe("mapLoyaltyCardToWalletModel", () => {
  it("maps core card data and uses card_token as barcode/public reference", () => {
    const model = mapLoyaltyCardToWalletModel({
      card: makeCard(),
      cardToken: "card_public_123",
    });

    expect(model.businessName).toBe("Panaderia Aurora");
    expect(model.customerName).toBe("Ada Lovelace");
    expect(model.points).toBe(42);
    expect(model.rewardProgressText).toContain("8 pts to Cafe gratis");
    expect(model.barcodeValue).toBe("card_public_123");
    expect(model.publicReference).toBe("card_public_123");
  });

  it("surfaces redeemable reward messaging when already unlocked", () => {
    const model = mapLoyaltyCardToWalletModel({
      card: makeCard({
        loyalty: {
          status: "redeemable",
          current_points: 160,
          reward_target_points: 150,
          progress_percentage_to_target: 100,
          remaining_points_to_target: 0,
          redeemable_reward: {
            id: "reward-2",
            name: "Postre gratis",
            points_required: 150,
            reward_description: "1 postre",
          },
          next_reward: null,
        },
      }),
      cardToken: "card_public_777",
    });

    expect(model.rewardProgressText).toBe("Reward available: Postre gratis");
    expect(model.rewardName).toBe("Postre gratis");
  });
});
