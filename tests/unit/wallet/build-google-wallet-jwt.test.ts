import { generateKeyPairSync } from "node:crypto";
import { buildGoogleWalletJwt } from "@/features/wallet/google/build-google-wallet-jwt";
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

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
  return Buffer.from(padded, "base64").toString("utf8");
}

describe("buildGoogleWalletJwt", () => {
  it("builds an RS256 JWT and save URL with class and object payload", () => {
    const { privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
    });

    const result = buildGoogleWalletJwt({
      walletModel,
      config: {
        issuerId: "issuer123",
        serviceAccountEmail: "wallet@returnos.iam.gserviceaccount.com",
        serviceAccountPrivateKey: privateKey.export({
          type: "pkcs8",
          format: "pem",
        }) as string,
        classSuffix: "returnos_loyalty",
      },
    });

    expect(result.classId).toBe("issuer123.returnos_loyalty");
    expect(result.objectId).toBe("issuer123.card_public_123");
    expect(result.addToGoogleWalletUrl).toContain(
      "https://pay.google.com/gp/v/save/",
    );

    const [encodedHeader, encodedClaims, encodedSignature] =
      result.jwt.split(".");

    expect(encodedHeader).toBeTruthy();
    expect(encodedClaims).toBeTruthy();
    expect(encodedSignature).toBeTruthy();

    const header = JSON.parse(decodeBase64Url(encodedHeader));
    const claims = JSON.parse(decodeBase64Url(encodedClaims));

    expect(header).toMatchObject({ alg: "RS256", typ: "JWT" });
    expect(claims).toMatchObject({
      iss: "wallet@returnos.iam.gserviceaccount.com",
      aud: "google",
      typ: "savetowallet",
    });
    expect(claims.payload.genericObjects[0].id).toBe(
      "issuer123.card_public_123",
    );
    expect(claims.payload.genericClasses[0].id).toBe(
      "issuer123.returnos_loyalty",
    );
  });
});
