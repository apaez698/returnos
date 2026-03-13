import { createServerClient } from "@/lib/supabase/server";
import type {
  LoyaltyLookupCustomer,
  LoyaltyLookupMatch,
} from "@/features/loyalty-card/types/loyalty-lookup-types";
import { normalizePhone } from "./normalize-phone";

type SupabaseClient = ReturnType<typeof createServerClient>;

export interface GetLoyaltyCardByPhoneInput {
  businessId: string;
  phone: string;
}

export interface GetLoyaltyCardByPhoneOptions {
  supabase?: SupabaseClient;
}

interface RawCustomerLookupRow {
  id: string;
  name: string | null;
  phone: string | null;
  card_token: string | null;
  card_enabled?: boolean | null;
}

function buildPhoneCandidates(normalizedPhone: string): string[] {
  if (!normalizedPhone) {
    return [];
  }

  const candidates = new Set<string>();
  const digits = normalizedPhone.replace(/^\+/, "");

  candidates.add(normalizedPhone);
  candidates.add(digits);

  if (digits.startsWith("52") && digits.length === 12) {
    candidates.add(digits.slice(2));
  }

  if (digits.length === 10) {
    candidates.add(`+52${digits}`);
    candidates.add(`52${digits}`);
  }

  if (digits.startsWith("00") && digits.length > 2) {
    candidates.add(`+${digits.slice(2)}`);
    candidates.add(digits.slice(2));
  }

  return [...candidates];
}

function isCardEnabledMissingColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = String((error as { message?: unknown }).message ?? "");
  const code = String((error as { code?: unknown }).code ?? "");

  return code === "42703" || /card_enabled/i.test(message);
}

async function findCustomerByCandidates(input: {
  supabase: SupabaseClient;
  businessId: string;
  phoneCandidates: string[];
}): Promise<RawCustomerLookupRow | null> {
  const baseSelect = "id, name, phone, card_token";
  const queryWithCardEnabled = input.supabase
    .from("customers")
    .select(`${baseSelect}, card_enabled`)
    .eq("business_id", input.businessId)
    .in("phone", input.phoneCandidates)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const withCardEnabledResponse = await queryWithCardEnabled;

  if (!withCardEnabledResponse.error) {
    return (
      (withCardEnabledResponse.data as RawCustomerLookupRow | null) ?? null
    );
  }

  if (!isCardEnabledMissingColumnError(withCardEnabledResponse.error)) {
    console.error(
      "Error loading loyalty card customer by phone:",
      withCardEnabledResponse.error,
    );
    throw new Error("Could not load loyalty card by phone.");
  }

  const withoutCardEnabledResponse = await input.supabase
    .from("customers")
    .select(baseSelect)
    .eq("business_id", input.businessId)
    .in("phone", input.phoneCandidates)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (withoutCardEnabledResponse.error) {
    console.error(
      "Error loading loyalty card customer by phone:",
      withoutCardEnabledResponse.error,
    );
    throw new Error("Could not load loyalty card by phone.");
  }

  return (
    (withoutCardEnabledResponse.data as RawCustomerLookupRow | null) ?? null
  );
}

export async function getLoyaltyCardByPhone(
  input: GetLoyaltyCardByPhoneInput,
  options: GetLoyaltyCardByPhoneOptions = {},
): Promise<LoyaltyLookupMatch | null> {
  const businessId = input.businessId.trim();
  const separatorsNormalizedPhone = normalizePhone(input.phone);
  const phoneDigits = separatorsNormalizedPhone.replace(/\D/g, "");
  const normalizedPhone = phoneDigits ? `+${phoneDigits}` : "";
  const phoneCandidates = buildPhoneCandidates(normalizedPhone);

  if (!businessId) {
    throw new Error("businessId is required for phone loyalty card lookup.");
  }

  if (phoneCandidates.length === 0) {
    return null;
  }

  const supabase = options.supabase ?? createServerClient();

  const customer = await findCustomerByCandidates({
    supabase,
    businessId,
    phoneCandidates,
  });

  if (!customer) {
    return null;
  }

  const mappedCustomer: LoyaltyLookupCustomer = {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    card_token: customer.card_token,
    card_enabled: customer.card_enabled,
  };

  return {
    business: {
      id: businessId,
    },
    customer: mappedCustomer,
    normalized_phone: normalizedPhone,
  };
}
