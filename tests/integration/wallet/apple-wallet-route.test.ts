import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/wallet/apple/route";
import { getLoyaltyCardByToken } from "@/features/loyalty-card/queries/get-loyalty-card-by-token";
import { buildApplePass } from "@/features/wallet/apple/build-apple-pass";
import { mapLoyaltyCardToWalletModel } from "@/features/wallet/shared/map-loyalty-card-to-wallet-model";

vi.mock("@/features/loyalty-card/queries/get-loyalty-card-by-token", () => ({
  getLoyaltyCardByToken: vi.fn(),
}));

vi.mock("@/features/wallet/shared/map-loyalty-card-to-wallet-model", () => ({
  mapLoyaltyCardToWalletModel: vi.fn(),
}));

vi.mock("@/features/wallet/apple/build-apple-pass", () => ({
  buildApplePass: vi.fn(),
}));

describe("Apple Wallet route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when card_token is missing", async () => {
    const response = await GET(
      new Request("https://returnos.dev/api/wallet/apple"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "card_token is required.",
    });
  });

  it("returns 404 when loyalty card does not exist", async () => {
    vi.mocked(getLoyaltyCardByToken).mockResolvedValue(null);

    const response = await GET(
      new Request("https://returnos.dev/api/wallet/apple?card_token=missing"),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Card not found.",
    });
  });

  it("returns a pkpass payload when card exists", async () => {
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

    vi.mocked(buildApplePass).mockResolvedValue({
      fileName: "card_public_123.pkpass",
      contentType: "application/vnd.apple.pkpass",
      packageBuffer: Buffer.from("PKPASS_MOCK"),
      passJson: {
        formatVersion: 1,
      },
      unsigned: true,
    } as never);

    const response = await GET(
      new Request(
        "https://returnos.dev/api/wallet/apple?card_token=card_public_123",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/vnd.apple.pkpass",
    );
    expect(response.headers.get("Content-Disposition")).toContain(".pkpass");
    expect(response.headers.get("X-ReturnOS-Pass-Signing")).toBe("unsigned");

    const body = Buffer.from(await response.arrayBuffer()).toString("utf8");
    expect(body).toBe("PKPASS_MOCK");
  });
});
