import { buildGoogleWalletClass } from "@/features/wallet/google/build-google-wallet-class";
import type { WalletLoyaltyModel } from "@/features/wallet/shared/map-loyalty-card-to-wallet-model";

const walletModel: WalletLoyaltyModel = {
  businessName: "Panaderia Aurora",
  customerName: "Ada Lovelace",
  points: 42,
  pointsDisplay: "42 pts",
  rewardProgressText: "8 pts to Cafe gratis",
  rewardProgressPercentage: 84,
  rewardName: "Cafe gratis",
  cardToken: "card_public_123",
  barcodeValue: "card_public_123",
  publicReference: "card_public_123",
};

describe("buildGoogleWalletClass", () => {
  it("builds a generic class payload with default issuer and program names", () => {
    const genericClass = buildGoogleWalletClass({
      walletModel,
      classId: "issuer123.returnos_loyalty",
    });

    expect(genericClass.id).toBe("issuer123.returnos_loyalty");
    expect(genericClass.issuerName).toBe("Panaderia Aurora");
    expect(genericClass.programName).toBe("Panaderia Aurora Rewards");
    expect(genericClass.reviewStatus).toBe("UNDER_REVIEW");
  });

  it("includes optional image assets when image URIs are provided", () => {
    const genericClass = buildGoogleWalletClass({
      walletModel,
      classId: "issuer123.returnos_loyalty",
      logoImageUri: "https://cdn.returnos.dev/logo.png",
      heroImageUri: "https://cdn.returnos.dev/hero.png",
    });

    expect(genericClass.logo?.sourceUri.uri).toBe(
      "https://cdn.returnos.dev/logo.png",
    );
    expect(genericClass.heroImage?.sourceUri.uri).toBe(
      "https://cdn.returnos.dev/hero.png",
    );
  });
});
