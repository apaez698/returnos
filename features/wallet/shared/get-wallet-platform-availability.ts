export interface WalletPlatformAvailability {
  apple: boolean;
  google: boolean;
}

function normalizeBoolean(value: string | undefined): boolean | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return null;
}

function hasValue(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function getWalletPlatformAvailability(
  env: NodeJS.ProcessEnv = process.env,
): WalletPlatformAvailability {
  const appleEnabledOverride = normalizeBoolean(env.APPLE_WALLET_ENABLED);
  const googleEnabledOverride = normalizeBoolean(env.GOOGLE_WALLET_ENABLED);

  const appleConfiguredByEnv =
    hasValue(env.APPLE_WALLET_PASS_TYPE_IDENTIFIER) &&
    hasValue(env.APPLE_WALLET_TEAM_IDENTIFIER);

  const googleConfiguredByEnv =
    hasValue(env.GOOGLE_WALLET_ISSUER_ID) &&
    hasValue(env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL) &&
    hasValue(env.GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY);

  return {
    apple: appleEnabledOverride ?? appleConfiguredByEnv,
    google: googleEnabledOverride ?? googleConfiguredByEnv,
  };
}
