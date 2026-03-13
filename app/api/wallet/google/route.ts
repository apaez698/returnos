import { NextResponse } from "next/server";
import { getLoyaltyCardByToken } from "@/features/loyalty-card/queries/get-loyalty-card-by-token";
import { buildGoogleWalletJwt } from "@/features/wallet/google/build-google-wallet-jwt";
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

function resolveGoogleWalletConfig(cardToken: string) {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const serviceAccountEmail = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL;
  const serviceAccountPrivateKey =
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!issuerId || !serviceAccountEmail || !serviceAccountPrivateKey) {
    return null;
  }

  return {
    issuerId,
    serviceAccountEmail,
    serviceAccountPrivateKey,
    classSuffix:
      process.env.GOOGLE_WALLET_GENERIC_CLASS_SUFFIX ?? "returnos_loyalty",
    objectSuffix: cardToken,
    issuerName: process.env.GOOGLE_WALLET_ISSUER_NAME,
    programName: process.env.GOOGLE_WALLET_PROGRAM_NAME,
    countryCode: process.env.GOOGLE_WALLET_COUNTRY_CODE,
    logoImageUri: process.env.GOOGLE_WALLET_LOGO_IMAGE_URI,
    heroImageUri: process.env.GOOGLE_WALLET_HERO_IMAGE_URI,
  };
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

    const jwtConfig = resolveGoogleWalletConfig(cardToken);

    if (!jwtConfig) {
      return NextResponse.json(
        {
          error:
            "Google Wallet is not configured. Missing issuer or service account credentials.",
        },
        { status: 500 },
      );
    }

    const walletModel = mapLoyaltyCardToWalletModel({
      card,
      cardToken,
    });

    const pass = buildGoogleWalletJwt({
      walletModel,
      config: jwtConfig,
    });

    return NextResponse.json(
      {
        addToGoogleWalletUrl: pass.addToGoogleWalletUrl,
        jwt: pass.jwt,
        classId: pass.classId,
        objectId: pass.objectId,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Error generating Google Wallet pass:", error);

    return NextResponse.json(
      { error: "Could not generate Google Wallet pass." },
      { status: 500 },
    );
  }
}
