"use server";

import { redirect } from "next/navigation";
import { getLoyaltyCardByPhone } from "@/features/loyalty-card/queries/get-loyalty-card-by-phone";
import { loyaltyPhoneSchema } from "@/features/loyalty-card/queries/loyalty-phone-schema";
import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { getBusinessBySlug } from "@/lib/businesses/queries";
import type { LoyaltyLookupState } from "./state";

async function resolveBusinessId(input: {
  businessId: string;
  businessSlug: string;
}): Promise<string | null> {
  if (input.businessId.trim().length > 0) {
    return input.businessId.trim();
  }

  if (input.businessSlug.trim().length > 0) {
    const business = await getBusinessBySlug(input.businessSlug.trim());
    return business?.id ?? null;
  }

  try {
    return await getCurrentBusinessId();
  } catch {
    return null;
  }
}

export async function lookupLoyaltyCardByPhoneAction(
  previousState: LoyaltyLookupState,
  formData: FormData,
): Promise<LoyaltyLookupState> {
  void previousState;

  const parsedPhone = loyaltyPhoneSchema.safeParse(
    String(formData.get("phone") ?? ""),
  );
  const businessId = String(formData.get("business_id") ?? "");
  const businessSlug = String(formData.get("business_slug") ?? "");

  if (!parsedPhone.success) {
    return {
      status: "error",
      message: parsedPhone.error.issues[0]?.message ?? "Revisa el telefono.",
    };
  }

  const phone = parsedPhone.data;

  const resolvedBusinessId = await resolveBusinessId({
    businessId,
    businessSlug,
  });

  if (!resolvedBusinessId) {
    return {
      status: "error",
      message:
        "No pudimos identificar el negocio actual. Intenta abrir este flujo desde tu enlace del negocio.",
    };
  }

  let card = null;

  try {
    card = await getLoyaltyCardByPhone({
      businessId: resolvedBusinessId,
      phone,
    });
  } catch {
    return {
      status: "error",
      message:
        "Tuvimos un problema al buscar tu tarjeta. Intenta nuevamente en unos segundos.",
    };
  }

  if (!card || !card.customer.card_token) {
    return {
      status: "not_found",
      message:
        "No encontramos una tarjeta con ese numero. Verifica los digitos e intenta de nuevo.",
    };
  }

  const token = encodeURIComponent(card.customer.card_token);
  redirect(`/card/${token}`);
}
