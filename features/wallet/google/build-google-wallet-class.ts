import type { WalletLoyaltyModel } from "@/features/wallet/shared/map-loyalty-card-to-wallet-model";

export interface GoogleWalletImage {
  sourceUri: {
    uri: string;
  };
  contentDescription?: {
    defaultValue: {
      language: string;
      value: string;
    };
  };
}

export interface GoogleWalletLocalizedString {
  defaultValue: {
    language: string;
    value: string;
  };
}

export interface GoogleWalletGenericClass {
  id: string;
  classTemplateInfo?: {
    cardTemplateOverride?: {
      cardRowTemplateInfos?: Array<{
        twoItems?: {
          startItem: {
            firstValue: {
              fields: Array<{ fieldPath: string }>;
            };
          };
          endItem: {
            firstValue: {
              fields: Array<{ fieldPath: string }>;
            };
          };
        };
      }>;
    };
  };
  countryCode: string;
  issuerName: string;
  programName: string;
  reviewStatus: "UNDER_REVIEW" | "APPROVED";
  logo?: GoogleWalletImage;
  heroImage?: GoogleWalletImage;
}

export interface BuildGoogleWalletClassInput {
  walletModel: WalletLoyaltyModel;
  classId: string;
  issuerName?: string;
  programName?: string;
  countryCode?: string;
  logoImageUri?: string;
  heroImageUri?: string;
}

function toImage(uri: string, description: string): GoogleWalletImage {
  return {
    sourceUri: {
      uri,
    },
    contentDescription: {
      defaultValue: {
        language: "en-US",
        value: description,
      },
    },
  };
}

export function buildGoogleWalletClass({
  walletModel,
  classId,
  issuerName,
  programName,
  countryCode = "US",
  logoImageUri,
  heroImageUri,
}: BuildGoogleWalletClassInput): GoogleWalletGenericClass {
  const resolvedIssuerName = issuerName ?? walletModel.businessName;
  const resolvedProgramName =
    programName ?? `${walletModel.businessName} Rewards`;

  return {
    id: classId,
    countryCode,
    issuerName: resolvedIssuerName,
    programName: resolvedProgramName,
    reviewStatus: "UNDER_REVIEW",
    classTemplateInfo: {
      cardTemplateOverride: {
        cardRowTemplateInfos: [
          {
            twoItems: {
              startItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.textModulesData['points']" }],
                },
              },
              endItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.textModulesData['progress']" }],
                },
              },
            },
          },
        ],
      },
    },
    ...(logoImageUri
      ? {
          logo: toImage(logoImageUri, `${resolvedIssuerName} logo`),
        }
      : {}),
    ...(heroImageUri
      ? {
          heroImage: toImage(heroImageUri, `${resolvedProgramName} banner`),
        }
      : {}),
  };
}
