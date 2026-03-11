"use server";

import { getBusinessBySlug } from "@/lib/businesses/queries";
import { createCustomerSchema } from "@/lib/customers/schema";
import { createServerClient } from "@/lib/supabase/server";
import type { PublicRegistrationResult } from "./types";

export async function registerPublicCustomerAction(
  slug: string,
  _previousState: PublicRegistrationResult,
  formData: FormData,
): Promise<PublicRegistrationResult> {
  const parsed = createCustomerSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    birthday: String(formData.get("birthday") ?? ""),
    consent_marketing: formData.get("consent_marketing") === "on",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Revisa los datos del formulario.",
      message: null,
    };
  }

  const business = await getBusinessBySlug(slug);

  if (!business) {
    return { success: false, error: "El negocio no existe.", message: null };
  }

  const supabase = createServerClient();

  const { error } = await supabase.from("customers").insert({
    business_id: business.id,
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email ?? null,
    birthday: parsed.data.birthday ?? null,
    consent_marketing: parsed.data.consent_marketing,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "Ya hay un registro con ese número de teléfono.",
        message: null,
      };
    }
    return {
      success: false,
      error: "No se pudo completar el registro. Intenta de nuevo.",
      message: null,
    };
  }

  return {
    success: true,
    error: null,
    message: "¡Registro exitoso! Bienvenido al programa de lealtad.",
  };
}
