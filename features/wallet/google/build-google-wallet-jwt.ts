import { createPrivateKey, createSign } from "node:crypto";
import {
  buildGoogleWalletClass,
  type GoogleWalletGenericClass,
} from "@/features/wallet/google/build-google-wallet-class";
import {
  buildGoogleWalletObject,
  type GoogleWalletGenericObject,
} from "@/features/wallet/google/build-google-wallet-object";
import type { WalletLoyaltyModel } from "@/features/wallet/shared/map-loyalty-card-to-wallet-model";

interface GoogleWalletJwtHeader {
  alg: "RS256";
  typ: "JWT";
}

interface GoogleWalletJwtClaims {
  iss: string;
  aud: "google";
  typ: "savetowallet";
  iat: number;
  payload: {
    genericClasses: GoogleWalletGenericClass[];
    genericObjects: GoogleWalletGenericObject[];
  };
}

export interface BuildGoogleWalletJwtConfig {
  issuerId: string;
  serviceAccountEmail: string;
  serviceAccountPrivateKey: string;
  classSuffix?: string;
  objectSuffix?: string;
  issuerName?: string;
  programName?: string;
  countryCode?: string;
  logoImageUri?: string;
  heroImageUri?: string;
}

export interface BuildGoogleWalletJwtInput {
  walletModel: WalletLoyaltyModel;
  config: BuildGoogleWalletJwtConfig;
}

export interface BuildGoogleWalletJwtResult {
  classId: string;
  objectId: string;
  genericClass: GoogleWalletGenericClass;
  genericObject: GoogleWalletGenericObject;
  jwt: string;
  addToGoogleWalletUrl: string;
}

function normalizeIdentifier(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9._-]/g, "_");
}

function toBase64Url(value: string): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signJwt(
  header: GoogleWalletJwtHeader,
  claims: GoogleWalletJwtClaims,
  privateKey: string,
): string {
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedClaims = toBase64Url(JSON.stringify(claims));
  const payload = `${encodedHeader}.${encodedClaims}`;

  const signer = createSign("RSA-SHA256");
  signer.update(payload);
  signer.end();

  const key = createPrivateKey(privateKey.replace(/\\n/g, "\n"));
  const signature = signer
    .sign(key)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${payload}.${signature}`;
}

export function buildGoogleWalletJwt({
  walletModel,
  config,
}: BuildGoogleWalletJwtInput): BuildGoogleWalletJwtResult {
  const classSuffix = normalizeIdentifier(
    config.classSuffix ?? "returnos_loyalty",
  );
  const objectSuffix = normalizeIdentifier(
    config.objectSuffix ?? walletModel.cardToken,
  );
  const classId = `${config.issuerId}.${classSuffix}`;
  const objectId = `${config.issuerId}.${objectSuffix}`;

  const genericClass = buildGoogleWalletClass({
    walletModel,
    classId,
    issuerName: config.issuerName,
    programName: config.programName,
    countryCode: config.countryCode,
    logoImageUri: config.logoImageUri,
    heroImageUri: config.heroImageUri,
  });

  const genericObject = buildGoogleWalletObject({
    walletModel,
    objectId,
    classId,
  });

  const claims: GoogleWalletJwtClaims = {
    iss: config.serviceAccountEmail,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    payload: {
      genericClasses: [genericClass],
      genericObjects: [genericObject],
    },
  };

  const jwt = signJwt(
    {
      alg: "RS256",
      typ: "JWT",
    },
    claims,
    config.serviceAccountPrivateKey,
  );

  return {
    classId,
    objectId,
    genericClass,
    genericObject,
    jwt,
    addToGoogleWalletUrl: `https://pay.google.com/gp/v/save/${jwt}`,
  };
}
