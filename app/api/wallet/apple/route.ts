import { NextResponse } from "next/server";
import { getLoyaltyCardByToken } from "@/features/loyalty-card/queries/get-loyalty-card-by-token";
import { buildApplePass } from "@/features/wallet/apple/build-apple-pass";
import { mapLoyaltyCardToWalletModel } from "@/features/wallet/shared/map-loyalty-card-to-wallet-model";

export const dynamic = "force-dynamic";

function getCardToken(request: Request): string | null {
  const url = new URL(request.url);
  const token =
    url.searchParams.get("card_token") ?? url.searchParams.get("token");

  if (!token) {
    return null;
  }

  const trimmedToken = token.trim();
  return trimmedToken.length > 0 ? trimmedToken : null;
}

export async function GET(request: Request) {
  const cardToken = getCardToken(request);

  if (!cardToken) {
    return NextResponse.json(
      { error: "card_token is required." },
      { status: 400 },
    );
  }

  try {
    const card = await getLoyaltyCardByToken(cardToken);

    if (!card) {
      return NextResponse.json({ error: "Card not found." }, { status: 404 });
    }

    const walletModel = mapLoyaltyCardToWalletModel({
      card,
      cardToken,
    });

    const pass = await buildApplePass({
      walletModel,
    });

    return new NextResponse(new Uint8Array(pass.packageBuffer), {
      status: 200,
      headers: {
        "Content-Type": pass.contentType,
        "Content-Disposition": `attachment; filename="${pass.fileName}"`,
        "Cache-Control": "no-store",
        "X-ReturnOS-Pass-Signing": pass.unsigned ? "unsigned" : "signed",
      },
    });
  } catch (error) {
    console.error("Error generating Apple Wallet pass:", error);

    return NextResponse.json(
      { error: "Could not generate Apple Wallet pass." },
      { status: 500 },
    );
  }
}
