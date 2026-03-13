import type { LoyaltyCardViewModel } from "@/features/loyalty-card/types/loyalty-card-types";

export interface WalletLoyaltyModel {
  businessName: string;
  customerName: string;
  points: number;
  pointsDisplay: string;
  rewardProgressText: string;
  rewardProgressPercentage: number;
  rewardName: string | null;
  cardToken: string;
  barcodeValue: string;
  publicReference: string;
}

export interface MapLoyaltyCardToWalletModelInput {
  card: LoyaltyCardViewModel;
  cardToken: string;
}

function resolveRewardProgressText(card: LoyaltyCardViewModel): string {
  if (card.loyalty.status === "no_reward") {
    return "No active rewards";
  }

  if (card.loyalty.redeemable_reward) {
    return `Reward available: ${card.loyalty.redeemable_reward.name}`;
  }

  if (card.loyalty.next_reward && card.loyalty.remaining_points_to_target > 0) {
    return `${card.loyalty.remaining_points_to_target} pts to ${card.loyalty.next_reward.name}`;
  }

  if (
    card.loyalty.reward_target_points &&
    card.loyalty.reward_target_points > 0
  ) {
    return `${card.loyalty.current_points}/${card.loyalty.reward_target_points} pts`;
  }

  return "Progress unavailable";
}

export function mapLoyaltyCardToWalletModel({
  card,
  cardToken,
}: MapLoyaltyCardToWalletModelInput): WalletLoyaltyModel {
  const points = Math.max(0, card.loyalty.current_points);

  return {
    businessName: card.business.name,
    customerName: card.customer.name,
    points,
    pointsDisplay: `${points} pts`,
    rewardProgressText: resolveRewardProgressText(card),
    rewardProgressPercentage: Math.min(
      100,
      Math.max(0, card.loyalty.progress_percentage_to_target),
    ),
    rewardName:
      card.loyalty.redeemable_reward?.name ??
      card.loyalty.next_reward?.name ??
      null,
    cardToken,
    barcodeValue: cardToken,
    publicReference: cardToken,
  };
}
