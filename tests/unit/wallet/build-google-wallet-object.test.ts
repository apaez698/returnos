import { buildGoogleWalletObject } from "@/features/wallet/google/build-google-wallet-object";
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

describe("buildGoogleWalletObject", () => {
  it("builds a generic object including customer, points, and progress", () => {
    const genericObject = buildGoogleWalletObject({
      walletModel,
      objectId: "issuer123.card_public_123",
      classId: "issuer123.returnos_loyalty",
    });

    expect(genericObject.id).toBe("issuer123.card_public_123");
    expect(genericObject.classId).toBe("issuer123.returnos_loyalty");
    expect(genericObject.cardTitle.defaultValue.value).toBe("Panaderia Aurora");
    expect(genericObject.header.defaultValue.value).toBe("Ada Lovelace");
    expect(genericObject.textModulesData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "points", body: "42 pts" }),
        expect.objectContaining({
          id: "progress",
          body: "8 pts to Cafe gratis",
        }),
      ]),
    );
  });

  it("maps card token into a scannable barcode reference", () => {
    const genericObject = buildGoogleWalletObject({
      walletModel,
      objectId: "issuer123.card_public_123",
      classId: "issuer123.returnos_loyalty",
    });

    expect(genericObject.barcode).toMatchObject({
      type: "QR_CODE",
      value: "card_public_123",
      alternateText: "card_public_123",
    });
  });
});
