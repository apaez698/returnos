import { buildApplePassFields } from "@/features/wallet/apple/apple-pass-fields";
import type { WalletLoyaltyModel } from "@/features/wallet/shared/map-loyalty-card-to-wallet-model";

const walletModel: WalletLoyaltyModel = {
  businessName: "Panaderia Aurora",
  customerName: "Ada Lovelace",
  points: 120,
  pointsDisplay: "120 pts",
  rewardProgressText: "30 pts to Cafe gratis",
  rewardProgressPercentage: 80,
  rewardName: "Cafe gratis",
  cardToken: "card_public_123",
  barcodeValue: "card_public_123",
  publicReference: "card_public_123",
};

describe("buildApplePassFields", () => {
  it("builds Apple Wallet field groups with business, customer, points and progress", () => {
    const fields = buildApplePassFields(walletModel);

    expect(fields.headerFields[0]).toMatchObject({
      key: "business",
      value: "Panaderia Aurora",
    });
    expect(fields.primaryFields[0]).toMatchObject({
      key: "points",
      value: 120,
    });
    expect(fields.secondaryFields[0]).toMatchObject({
      key: "customerName",
      value: "Ada Lovelace",
    });
    expect(fields.auxiliaryFields[0]).toMatchObject({
      key: "rewardProgress",
      value: "30 pts to Cafe gratis",
    });
  });

  it("includes card_token as public card reference in back fields", () => {
    const fields = buildApplePassFields(walletModel);

    expect(fields.backFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "publicReference",
          value: "card_public_123",
        }),
      ]),
    );
  });
});
