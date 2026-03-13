import { createHash } from "node:crypto";
import JSZip from "jszip";
import { buildApplePassFields } from "@/features/wallet/apple/apple-pass-fields";
import type { WalletLoyaltyModel } from "@/features/wallet/shared/map-loyalty-card-to-wallet-model";

interface ApplePassBarcode {
  format: "PKBarcodeFormatQR";
  message: string;
  messageEncoding: "iso-8859-1";
  altText?: string;
}

interface ApplePassJson {
  formatVersion: 1;
  passTypeIdentifier: string;
  serialNumber: string;
  teamIdentifier: string;
  organizationName: string;
  description: string;
  logoText: string;
  generic: ReturnType<typeof buildApplePassFields>;
  barcode: ApplePassBarcode;
  barcodes: ApplePassBarcode[];
  backgroundColor: string;
  foregroundColor: string;
  labelColor: string;
  webServiceURL?: string;
  authenticationToken?: string;
}

export interface AppleWalletConfig {
  passTypeIdentifier: string;
  teamIdentifier: string;
  organizationName: string;
  description: string;
  logoText: string;
  webServiceURL: string;
  authenticationToken: string;
  backgroundColor: string;
  foregroundColor: string;
  labelColor: string;
}

export interface BuildApplePassInput {
  walletModel: WalletLoyaltyModel;
  config?: Partial<AppleWalletConfig>;
}

export interface BuildApplePassResult {
  fileName: string;
  contentType: "application/vnd.apple.pkpass";
  packageBuffer: Buffer;
  passJson: ApplePassJson;
  unsigned: true;
}

function sha1Hex(value: string): string {
  return createHash("sha1").update(value).digest("hex");
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function resolveDefaultConfig(
  walletModel: WalletLoyaltyModel,
): AppleWalletConfig {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  return {
    passTypeIdentifier:
      process.env.APPLE_WALLET_PASS_TYPE_IDENTIFIER ??
      "pass.com.returnos.loyalty",
    teamIdentifier: process.env.APPLE_WALLET_TEAM_IDENTIFIER ?? "RETURNOS",
    organizationName: walletModel.businessName,
    description: `${walletModel.businessName} loyalty card`,
    logoText: walletModel.businessName,
    webServiceURL:
      process.env.APPLE_WALLET_WEB_SERVICE_URL ??
      `${appUrl}/api/wallet/apple/web-service`,
    authenticationToken:
      process.env.APPLE_WALLET_AUTH_TOKEN ??
      `dev-${sha256Hex(walletModel.cardToken).slice(0, 24)}`,
    backgroundColor: "rgb(15, 23, 42)",
    foregroundColor: "rgb(255, 255, 255)",
    labelColor: "rgb(191, 219, 254)",
  };
}

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 64) || "returnos-card";
}

export async function buildApplePass({
  walletModel,
  config,
}: BuildApplePassInput): Promise<BuildApplePassResult> {
  const resolvedConfig = {
    ...resolveDefaultConfig(walletModel),
    ...(config ?? {}),
  };

  const passFields = buildApplePassFields(walletModel);

  const passJson: ApplePassJson = {
    formatVersion: 1,
    passTypeIdentifier: resolvedConfig.passTypeIdentifier,
    serialNumber: walletModel.cardToken,
    teamIdentifier: resolvedConfig.teamIdentifier,
    organizationName: resolvedConfig.organizationName,
    description: resolvedConfig.description,
    logoText: resolvedConfig.logoText,
    generic: passFields,
    barcode: {
      format: "PKBarcodeFormatQR",
      message: walletModel.barcodeValue,
      messageEncoding: "iso-8859-1",
      altText: walletModel.publicReference,
    },
    barcodes: [
      {
        format: "PKBarcodeFormatQR",
        message: walletModel.barcodeValue,
        messageEncoding: "iso-8859-1",
        altText: walletModel.publicReference,
      },
    ],
    backgroundColor: resolvedConfig.backgroundColor,
    foregroundColor: resolvedConfig.foregroundColor,
    labelColor: resolvedConfig.labelColor,
    webServiceURL: resolvedConfig.webServiceURL,
    authenticationToken: resolvedConfig.authenticationToken,
  };

  const passJsonContent = `${JSON.stringify(passJson, null, 2)}\n`;
  const manifest = {
    "pass.json": sha1Hex(passJsonContent),
  };

  const zip = new JSZip();
  zip.file("pass.json", passJsonContent);
  zip.file("manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);

  const packageBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return {
    fileName: `${sanitizeFileName(walletModel.cardToken)}.pkpass`,
    contentType: "application/vnd.apple.pkpass",
    packageBuffer,
    passJson,
    unsigned: true,
  };
}
