import type { WalletLoyaltyModel } from "@/features/wallet/shared/map-loyalty-card-to-wallet-model";

export interface ApplePassField {
  key: string;
  label: string;
  value: string | number;
  textAlignment?:
    | "PKTextAlignmentLeft"
    | "PKTextAlignmentCenter"
    | "PKTextAlignmentRight";
  changeMessage?: string;
}

export interface ApplePassFieldSets {
  headerFields: ApplePassField[];
  primaryFields: ApplePassField[];
  secondaryFields: ApplePassField[];
  auxiliaryFields: ApplePassField[];
  backFields: ApplePassField[];
}

export function buildApplePassFields(
  walletModel: WalletLoyaltyModel,
): ApplePassFieldSets {
  return {
    headerFields: [
      {
        key: "business",
        label: "Business",
        value: walletModel.businessName,
      },
    ],
    primaryFields: [
      {
        key: "points",
        label: "Points",
        value: walletModel.points,
        textAlignment: "PKTextAlignmentRight",
        changeMessage: "Your points changed to %@.",
      },
    ],
    secondaryFields: [
      {
        key: "customerName",
        label: "Customer",
        value: walletModel.customerName,
      },
    ],
    auxiliaryFields: [
      {
        key: "rewardProgress",
        label: "Reward progress",
        value: walletModel.rewardProgressText,
      },
      {
        key: "progressPercentage",
        label: "Progress",
        value: `${walletModel.rewardProgressPercentage}%`,
      },
    ],
    backFields: [
      {
        key: "publicReference",
        label: "Card reference",
        value: walletModel.publicReference,
      },
      {
        key: "reward",
        label: "Current reward",
        value: walletModel.rewardName ?? "None",
      },
    ],
  };
}
