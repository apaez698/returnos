import { createHmac, timingSafeEqual } from "node:crypto";
import { createServerClient } from "@/lib/supabase/server";
import { mapLoyaltyCardViewModel } from "@/features/loyalty-card/utils/map-loyalty-card-view-model";
import type {
  LoyaltyCardTokenPayload,
  LoyaltyCardViewModel,
  RawLoyaltyCustomerRow,
  RawLoyaltyRewardRuleRow,
} from "@/features/loyalty-card/types/loyalty-card-types";

const TOKEN_VERSION = "v1";

type SupabaseClient = ReturnType<typeof createServerClient>;

export interface GetLoyaltyCardByTokenOptions {
  supabase?: SupabaseClient;
  now?: () => Date;
  tokenSecret?: string;
}

interface CustomerScope {
  customerId: string;
  businessId: string;
}

function getTokenSecret(overrideSecret?: string): string {
  const secret = overrideSecret ?? process.env.LOYALTY_CARD_TOKEN_SECRET;

  if (!secret || secret.trim().length < 32) {
    throw new Error(
      "Missing or weak LOYALTY_CARD_TOKEN_SECRET. Expected at least 32 characters.",
    );
  }

  return secret;
}

function isValidPayloadShape(value: unknown): value is LoyaltyCardTokenPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<LoyaltyCardTokenPayload>;

  return (
    payload.v === 1 &&
    typeof payload.business_id === "string" &&
    payload.business_id.length > 0 &&
    typeof payload.customer_id === "string" &&
    payload.customer_id.length > 0 &&
    typeof payload.exp === "number" &&
    Number.isFinite(payload.exp)
  );
}

function verifyTokenSignature(
  signedPayload: string,
  signatureBase64Url: string,
  secret: string,
): boolean {
  try {
    const providedSignature = Buffer.from(signatureBase64Url, "base64url");
    const expectedSignature = createHmac("sha256", secret)
      .update(signedPayload)
      .digest();

    if (providedSignature.length !== expectedSignature.length) {
      return false;
    }

    return timingSafeEqual(providedSignature, expectedSignature);
  } catch {
    return false;
  }
}

function parseAndVerifyLoyaltyCardToken(
  token: string,
  secret: string,
  now: Date,
): LoyaltyCardTokenPayload | null {
  const trimmed = token.trim();
  const parts = trimmed.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [version, payloadBase64Url, signatureBase64Url] = parts;

  if (version !== TOKEN_VERSION) {
    return null;
  }

  const signedPayload = `${version}.${payloadBase64Url}`;

  if (!verifyTokenSignature(signedPayload, signatureBase64Url, secret)) {
    return null;
  }

  try {
    const decodedPayload = Buffer.from(payloadBase64Url, "base64url").toString(
      "utf8",
    );
    const parsed = JSON.parse(decodedPayload) as unknown;

    if (!isValidPayloadShape(parsed)) {
      return null;
    }

    const nowEpochSeconds = Math.floor(now.getTime() / 1000);

    if (parsed.exp <= nowEpochSeconds) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function isSignedTokenFormat(token: string): boolean {
  const parts = token.trim().split(".");
  return parts.length === 3 && parts[0] === TOKEN_VERSION;
}

async function resolveCustomerScopeFromToken(input: {
  token: string;
  now: Date;
  tokenSecret?: string;
  supabase: SupabaseClient;
}): Promise<CustomerScope | null> {
  if (isSignedTokenFormat(input.token)) {
    const secret = getTokenSecret(input.tokenSecret);
    const payload = parseAndVerifyLoyaltyCardToken(
      input.token,
      secret,
      input.now,
    );

    if (!payload) {
      return null;
    }

    return {
      customerId: payload.customer_id,
      businessId: payload.business_id,
    };
  }

  const legacyTokenLookup = await input.supabase
    .from("customers")
    .select("id, business_id")
    .eq("card_token", input.token.trim())
    .limit(1)
    .maybeSingle();

  if (legacyTokenLookup.error) {
    console.error(
      "Error loading loyalty card customer scope by legacy token:",
      legacyTokenLookup.error,
    );
    throw new Error("Could not load loyalty card data.");
  }

  if (!legacyTokenLookup.data) {
    return null;
  }

  return {
    customerId: legacyTokenLookup.data.id,
    businessId: legacyTokenLookup.data.business_id,
  };
}

export async function getLoyaltyCardByToken(
  token: string,
  options: GetLoyaltyCardByTokenOptions = {},
): Promise<LoyaltyCardViewModel | null> {
  if (!token || token.trim().length === 0) {
    return null;
  }

  const now = options.now?.() ?? new Date();
  const supabase = options.supabase ?? createServerClient();
  const scope = await resolveCustomerScopeFromToken({
    token,
    now,
    tokenSecret: options.tokenSecret,
    supabase,
  });

  if (!scope) {
    return null;
  }

  const [{ data: customer, error: customerError }, rewardRulesResponse] =
    await Promise.all([
      supabase
        .from("customers")
        .select(
          "id, business_id, name, phone, points, businesses!inner(id, name, slug, business_type)",
        )
        .eq("id", scope.customerId)
        .eq("business_id", scope.businessId)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("reward_rules")
        .select(
          "id, business_id, name, points_required, reward_description, is_active, created_at",
        )
        .eq("business_id", scope.businessId)
        .eq("is_active", true)
        .order("points_required", { ascending: true }),
    ]);

  if (customerError) {
    console.error(
      "Error loading loyalty card customer by token:",
      customerError,
    );
    throw new Error("Could not load loyalty card data.");
  }

  if (!customer) {
    return null;
  }

  if (rewardRulesResponse.error) {
    console.error(
      "Error loading loyalty card reward rules by token:",
      rewardRulesResponse.error,
    );
    throw new Error("Could not load loyalty rewards data.");
  }

  return mapLoyaltyCardViewModel({
    customer: customer as RawLoyaltyCustomerRow,
    activeRewardRules: (rewardRulesResponse.data ??
      []) as RawLoyaltyRewardRuleRow[],
  });
}
