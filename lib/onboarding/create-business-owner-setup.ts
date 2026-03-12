import { createServerClient } from "@/lib/supabase/server";
import type { CreateBusinessOwnerInput } from "./onboarding-schema";

const MAX_SLUG_ATTEMPTS = 5;

export interface CreateBusinessOwnerSetupInput extends CreateBusinessOwnerInput {
  userId: string;
}

export interface CreateBusinessOwnerSetupResult {
  success: boolean;
  businessId: string | null;
  slug: string | null;
  error: string | null;
}

function toBaseSlug(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (normalized.length === 0) {
    return "negocio";
  }

  return normalized.slice(0, 48);
}

function buildCandidateSlug(baseSlug: string, attempt: number): string {
  if (attempt === 0) {
    return baseSlug;
  }

  return `${baseSlug}-${attempt + 1}`;
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeCode = (error as { code?: string }).code;
  return maybeCode === "23505";
}

async function cleanupOrphanBusiness(businessId: string): Promise<void> {
  const supabase = createServerClient();
  await supabase.from("businesses").delete().eq("id", businessId);
}

export async function createBusinessOwnerSetup({
  userId,
  businessName,
  businessType,
}: CreateBusinessOwnerSetupInput): Promise<CreateBusinessOwnerSetupResult> {
  const supabase = createServerClient();

  const { data: existingMembership, error: membershipLookupError } =
    await supabase
      .from("business_users")
      .select("business_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

  if (membershipLookupError) {
    return {
      success: false,
      businessId: null,
      slug: null,
      error: "No pudimos validar tu membresia actual.",
    };
  }

  if (existingMembership?.business_id) {
    return {
      success: false,
      businessId: existingMembership.business_id,
      slug: null,
      error: "Tu usuario ya esta vinculado a un negocio.",
    };
  }

  const baseSlug = toBaseSlug(businessName);

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const candidateSlug = buildCandidateSlug(baseSlug, attempt);

    const { data: business, error: businessInsertError } = await supabase
      .from("businesses")
      .insert({
        name: businessName,
        slug: candidateSlug,
        business_type: businessType,
      })
      .select("id, slug")
      .single();

    if (businessInsertError) {
      if (isUniqueViolation(businessInsertError)) {
        continue;
      }

      return {
        success: false,
        businessId: null,
        slug: null,
        error: "No se pudo crear tu negocio.",
      };
    }

    const { error: membershipInsertError } = await supabase
      .from("business_users")
      .insert({
        business_id: business.id,
        user_id: userId,
        role: "owner",
      });

    if (membershipInsertError) {
      await cleanupOrphanBusiness(business.id);
      return {
        success: false,
        businessId: null,
        slug: null,
        error: "No se pudo asignar tu usuario como owner del negocio.",
      };
    }

    return {
      success: true,
      businessId: business.id,
      slug: business.slug,
      error: null,
    };
  }

  return {
    success: false,
    businessId: null,
    slug: null,
    error: "Ese nombre ya existe. Prueba con una variacion.",
  };
}
