# ReturnOS Wallet Demo Flow

This document defines the MVP demo strategy for wallet integration under current local-development constraints.

## Goals

- Demonstrate card-to-wallet entry points from ReturnOS loyalty card pages.
- Show both wallet paths with realistic behavior:
  - Apple Wallet pass download
  - Google Wallet save-link redirect
- Avoid blocking demos on production-only signing/issuer approvals.

## Demo Preconditions

1. A valid loyalty card token exists in your environment.
2. Wallet env variables are set in `.env.local`.
3. App is running locally (`npm run dev`).
4. Browser allows file downloads and navigation pop/redirect behavior.

## Recommended Demo Config

Use these toggles for predictable button visibility:

- `APPLE_WALLET_ENABLED=true`
- `GOOGLE_WALLET_ENABLED=true`

If a platform is not ready, disable it explicitly to avoid broken interactions:

- `APPLE_WALLET_ENABLED=false` or
- `GOOGLE_WALLET_ENABLED=false`

## Demo Script (MVP)

1. Open loyalty card page:
   - `/card/<token>`
2. Confirm Add to wallet block is visible.
3. Apple Wallet path:
   - Click Add to Apple Wallet.
   - Expected result: browser downloads `<token>.pkpass`.
   - Explain that in MVP/local, pass package is unsigned for development.
4. Google Wallet path:
   - Click Add to Google Wallet.
   - Expected result: app calls `/api/wallet/google?card_token=<token>` and navigates to Google Save URL.
   - Explain that actual wallet save completion happens in Google UI/app.

## What to Say During Demo

Use this message for stakeholder clarity:

- ReturnOS already maps live loyalty data to wallet payloads for both ecosystems.
- Google path is using signed JWT and issuer-bound identifiers.
- Apple path currently demonstrates pass package generation and download in dev mode.
- Final production hardening mainly adds Apple certificate signing and production wallet console approvals.

## MVP Data Mapping Storyline

When presenting the demo, highlight these business-facing mappings:

- Card identity:
  - `cardToken` is used as barcode value and public reference.
- Customer personalization:
  - Customer name appears on wallet object/pass.
- Loyalty value:
  - Current points shown as a primary value.
- Reward momentum:
  - Progress text communicates either remaining points or unlocked reward.

This keeps wallet surfaces aligned with the same loyalty state seen inside ReturnOS.

## Local Dev Limitations and Workarounds

1. Apple pass signing not enabled
   - Limitation: generated package is unsigned.
   - Demo workaround: validate payload download and explain signing is a production step.
2. Native wallet app behavior not fully reproducible on desktop
   - Limitation: phone OS handling differs from desktop browser behavior.
   - Demo workaround: include one mobile smoke test on iPhone/Android before external demos.
3. External redirects in test environments
   - Limitation: headless/jsdom cannot complete true navigation to wallet endpoints.
   - Demo workaround: validate API response and loading/error states in automated tests.
4. Localhost trust and callback constraints
   - Limitation: full wallet web-service callback lifecycle is not covered in localhost demos.
   - Demo workaround: treat callbacks/push updates as production validation items.

## Suggested Demo Matrix

Use this matrix before stakeholder demos:

1. Desktop browser (Chrome or Edge)
   - Apple button: confirms file download.
   - Google button: confirms redirect URL generation.
2. Android device
   - Google Wallet flow reaches Save screen with expected merchant and customer details.
3. iPhone device
   - Apple Wallet import tested using a signed pass in staging/production-like environment.

## Exit Criteria For MVP Demo Readiness

Demo is considered ready when all are true:

1. Both wallet buttons render based on intended env toggles.
2. Apple endpoint returns `application/vnd.apple.pkpass` and non-empty payload.
3. Google endpoint returns `addToGoogleWalletUrl`, `jwt`, `classId`, and `objectId`.
4. Sample card shows consistent points/progress values across ReturnOS UI and wallet payloads.
5. Presenter can clearly explain current dev limitations versus production hardening tasks.
