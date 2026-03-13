# ReturnOS Wallet Setup (Apple Wallet + Google Wallet)

This guide documents the current MVP wallet integration setup in ReturnOS.

## Scope

- Apple Wallet pass generation endpoint: `/api/wallet/apple?card_token=<token>`
- Google Wallet save-link endpoint: `/api/wallet/google?card_token=<token>`
- Card UI entry point: `/card/[token]`

## Environment Variables

Set these in `.env.local` for local development and keep `.env.local.example` as the template.

### Required for Wallet Button Visibility Logic

ReturnOS decides wallet button availability from environment values.

- `APPLE_WALLET_ENABLED` (optional override)
  - Accepted true values: `1`, `true`, `yes`, `on`
  - Accepted false values: `0`, `false`, `no`, `off`
  - If omitted, Apple button availability falls back to required Apple config keys.
- `GOOGLE_WALLET_ENABLED` (optional override)
  - Same parsing rules as above.
  - If omitted, Google button availability falls back to required Google config keys.

### Apple Wallet Variables

- `APPLE_WALLET_PASS_TYPE_IDENTIFIER`
  - Example: `pass.com.returnos.loyalty`
  - Used as `passTypeIdentifier` in `pass.json`.
- `APPLE_WALLET_TEAM_IDENTIFIER`
  - Apple Developer Team ID.
  - Used as `teamIdentifier` in `pass.json`.
- `APPLE_WALLET_WEB_SERVICE_URL`
  - Example: `http://localhost:3000/api/wallet/apple/web-service`
  - Included in generated pass payload.
- `APPLE_WALLET_AUTH_TOKEN`
  - Shared token used by Apple Wallet web service callbacks.

### Google Wallet Variables

- `GOOGLE_WALLET_ISSUER_ID`
  - Wallet issuer ID from Google Wallet Business Console.
- `GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL`
  - Service account email used as JWT issuer (`iss`).
- `GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY`
  - Private key used to sign RS256 JWT.
  - Use escaped newlines (`\\n`) in env files.
- `GOOGLE_WALLET_GENERIC_CLASS_SUFFIX`
  - Default: `returnos_loyalty`
- `GOOGLE_WALLET_ISSUER_NAME`
  - Optional display issuer name.
- `GOOGLE_WALLET_PROGRAM_NAME`
  - Optional display program name.
- `GOOGLE_WALLET_COUNTRY_CODE`
  - Optional ISO country code. Current default in code is `US` if missing.
- `GOOGLE_WALLET_LOGO_IMAGE_URI`
  - Optional absolute URL to logo image.
- `GOOGLE_WALLET_HERO_IMAGE_URI`
  - Optional absolute URL to hero/banner image.

### Shared Variable

- `APP_URL`
  - Used as fallback base URL for Apple Wallet web service URL construction.

## Apple Wallet Prerequisites

Before production Apple Wallet rollout, prepare the following in Apple Developer:

1. Apple Developer Program membership (active).
2. Pass Type ID (matches `APPLE_WALLET_PASS_TYPE_IDENTIFIER`).
3. Team ID (matches `APPLE_WALLET_TEAM_IDENTIFIER`).
4. Apple Wallet certificate chain and signing materials:
   - Pass Type certificate (.cer/.p12)
   - Private key for signing
   - WWDR certificate
5. Hosted pass assets and pass web service endpoints (if using update/push flows).

Important current MVP status:

- ReturnOS currently generates an unsigned `.pkpass` package for local/dev demo workflows.
- Production signing is not wired yet in the current implementation.
- Response header `X-ReturnOS-Pass-Signing` is currently `unsigned`.

## Google Wallet Prerequisites

Before production Google Wallet rollout, prepare the following:

1. Google Wallet issuer configuration in Google Wallet Business Console.
2. Issuer ID (set in `GOOGLE_WALLET_ISSUER_ID`).
3. Google Cloud project linked to wallet issuer.
4. Service account in the linked Google Cloud project.
5. Private key JSON downloaded for that service account.
6. API access enabled for Wallet Objects API in the project.
7. Service account permissions to create/update wallet objects/classes for the issuer.

Operational notes:

- ReturnOS currently generates Save to Google Wallet URL using a signed JWT.
- JWT signing uses RS256 and `GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY`.
- Class ID and object ID are composed as `<issuerId>.<suffix>`.

## MVP Data Mapping Decisions

The current mapping intentionally uses a shared wallet model for both platforms.

### Shared Wallet Model Inputs

From loyalty card data, ReturnOS maps:

- `businessName` <- business name
- `customerName` <- customer name
- `points` / `pointsDisplay` <- current points
- `rewardProgressText` <- computed text based on status
- `rewardProgressPercentage` <- clamped 0..100
- `cardToken` <- card token
- `barcodeValue` <- card token
- `publicReference` <- card token

### Apple Wallet Mapping (MVP)

- Barcode format: QR
- Barcode message: card token
- Main pass identifiers from env (`passTypeIdentifier`, `teamIdentifier`)
- Visual colors are static MVP defaults
- Package currently includes:
  - `pass.json`
  - `manifest.json`
- Signature file is not included yet (unsigned dev package)

### Google Wallet Mapping (MVP)

Class payload:

- `issuerName`: env override or business name
- `programName`: env override or `<businessName> Rewards`
- `reviewStatus`: `UNDER_REVIEW`
- Optional image fields from env URIs

Object payload:

- `cardTitle`: business name
- `header`: customer name
- `subheader`: points display
- `barcode`: QR with token and reference
- Text modules:
  - points
  - progress
  - card reference

## Local Development Limitations

Current known limitations for local/dev:

1. Apple pass is unsigned, so real Apple Wallet import validation is limited.
2. Google Wallet redirect requires a browser navigation flow; jsdom tests do not perform real external navigation.
3. Mobile wallet behavior (native app handling, OS-specific prompts) cannot be fully validated from desktop localhost only.
4. Apple web service callbacks and push update flows are not fully exercised in local-only setup.

## Quick Setup Checklist

1. Fill wallet env vars in `.env.local`.
2. Keep `.env.local.example` updated for team onboarding.
3. Start app with `npm run dev`.
4. Open a valid card page (`/card/[token]`).
5. Verify wallet button visibility matches env configuration.
6. Apple: click button and verify `.pkpass` download response.
7. Google: click button and verify Save URL generation/redirect.
8. For production rollout, complete Apple signing and Google issuer verification requirements above.
