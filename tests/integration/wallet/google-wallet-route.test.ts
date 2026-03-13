import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/wallet/google/route";
import { getLoyaltyCardByToken } from "@/features/loyalty-card/queries/get-loyalty-card-by-token";
import { buildGoogleWalletJwt } from "@/features/wallet/google/build-google-wallet-jwt";
import { mapLoyaltyCardToWalletModel } from "@/features/wallet/shared/map-loyalty-card-to-wallet-model";

vi.mock("@/features/loyalty-card/queries/get-loyalty-card-by-token", () => ({
  getLoyaltyCardByToken: vi.fn(),
}));

vi.mock("@/features/wallet/shared/map-loyalty-card-to-wallet-model", () => ({
  mapLoyaltyCardToWalletModel: vi.fn(),
}));

vi.mock("@/features/wallet/google/build-google-wallet-jwt", () => ({
  buildGoogleWalletJwt: vi.fn(),
}));

describe("Google Wallet route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_WALLET_ISSUER_ID = "issuer123";
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL =
      "wallet@returnos.iam.gserviceaccount.com";
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY =
      "-----BEGIN PRIVATE KEY-----\\nmock\\n-----END PRIVATE KEY-----";
  });

  it("returns 400 when card_token is missing", async () => {
    const response = await GET(
      new Request("https://returnos.dev/api/wallet/google"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "card_token is required.",
    });
  });

  it("returns 404 when loyalty card does not exist", async () => {
    vi.mocked(getLoyaltyCardByToken).mockResolvedValue(null);

    const response = await GET(
      new Request("https://returnos.dev/api/wallet/google?card_token=missing"),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Card not found.",
    });
  });

  it("returns Add to Google Wallet URL and identifiers when card exists", async () => {
    vi.mocked(getLoyaltyCardByToken).mockResolvedValue({
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
    });

    vi.mocked(mapLoyaltyCardToWalletModel).mockReturnValue({
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
    });

    vi.mocked(buildGoogleWalletJwt).mockReturnValue({
      classId: "issuer123.returnos_loyalty",
      objectId: "issuer123.card_public_123",
      genericClass: {
        id: "issuer123.returnos_loyalty",
        countryCode: "US",
        issuerName: "Panaderia Aurora",
        programName: "Panaderia Aurora Rewards",
        reviewStatus: "UNDER_REVIEW",
      },
      genericObject: {
        id: "issuer123.card_public_123",
        classId: "issuer123.returnos_loyalty",
        state: "ACTIVE",
        cardTitle: {
          defaultValue: {
            language: "en-US",
            value: "Panaderia Aurora",
          },
        },
        header: {
          defaultValue: {
            language: "en-US",
            value: "Ada Lovelace",
          },
        },
        barcode: {
          type: "QR_CODE",
          value: "card_public_123",
        },
        textModulesData: [],
      },
      jwt: "header.payload.signature",
      addToGoogleWalletUrl:
        "https://pay.google.com/gp/v/save/header.payload.signature",
    } as never);

    const response = await GET(
      new Request(
        "https://returnos.dev/api/wallet/google?card_token=card_public_123",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      addToGoogleWalletUrl:
        "https://pay.google.com/gp/v/save/header.payload.signature",
      jwt: "header.payload.signature",
      classId: "issuer123.returnos_loyalty",
      objectId: "issuer123.card_public_123",
    });
  });
});
