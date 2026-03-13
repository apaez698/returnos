import type { WalletLoyaltyModel } from "@/features/wallet/shared/map-loyalty-card-to-wallet-model";

export interface GoogleWalletGenericObject {
  id: string;
  classId: string;
  state: "ACTIVE" | "INACTIVE";
  cardTitle: {
    defaultValue: {
      language: string;
      value: string;
    };
  };
  header: {
    defaultValue: {
      language: string;
      value: string;
    };
  };
  subheader?: {
    defaultValue: {
      language: string;
      value: string;
    };
  };
  barcode: {
    type: "QR_CODE" | "CODE_128";
    value: string;
    alternateText?: string;
  };
  textModulesData: Array<{
    id: string;
    header: string;
    body: string;
  }>;
}

export interface BuildGoogleWalletObjectInput {
  walletModel: WalletLoyaltyModel;
  objectId: string;
  classId: string;
  language?: string;
}

export function buildGoogleWalletObject({
  walletModel,
  objectId,
  classId,
  language = "en-US",
}: BuildGoogleWalletObjectInput): GoogleWalletGenericObject {
  return {
    id: objectId,
    classId,
    state: "ACTIVE",
    cardTitle: {
      defaultValue: {
        language,
        value: walletModel.businessName,
      },
    },
    header: {
      defaultValue: {
        language,
        value: walletModel.customerName,
      },
    },
    subheader: {
      defaultValue: {
        language,
        value: walletModel.pointsDisplay,
      },
    },
    barcode: {
      type: "QR_CODE",
      value: walletModel.barcodeValue,
      alternateText: walletModel.publicReference,
    },
    textModulesData: [
      {
        id: "points",
        header: "Points",
        body: walletModel.pointsDisplay,
      },
      {
        id: "progress",
        header: "Progress",
        body: walletModel.rewardProgressText,
      },
      {
        id: "card_reference",
        header: "Card reference",
        body: walletModel.publicReference,
      },
    ],
  };
}
