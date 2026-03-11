"use server";

import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { visitRegistrationSchema } from "@/lib/visits/schema";
import { createServerClient } from "@/lib/supabase/server";

export type RegisterVisitResult = {
  success: boolean;
  error: string | null;
  message: string | null;
};

/**
 * Register a customer visit in the current business.
 * Validates input, verifies customer ownership, inserts visit record,
 * and updates customer's last_visit_at and points.
 */
export async function registerCustomerVisit(
  input: unknown,
): Promise<RegisterVisitResult> {
  // Validate input
  const parsed = visitRegistrationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Datos de visita inválidos.",
      message: null,
    };
  }

  try {
    const businessId = await getCurrentBusinessId();
    const supabase = createServerClient();

    // Verify customer belongs to the current business
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, points")
      .eq("id", parsed.data.customer_id)
      .eq("business_id", businessId)
      .limit(1)
      .maybeSingle();

    if (customerError || !customer) {
      return {
        success: false,
        error: "Cliente no encontrado o no pertenece a este negocio.",
        message: null,
      };
    }

    // Insert visit record
    const { error: insertError } = await supabase.from("visits").insert({
      business_id: businessId,
      customer_id: parsed.data.customer_id,
      points_earned: parsed.data.points_earned,
      amount: parsed.data.amount ?? null,
      product_category: parsed.data.product_category ?? null,
      source: parsed.data.source,
    });

    if (insertError) {
      return {
        success: false,
        error: "No se pudo guardar la visita.",
        message: null,
      };
    }

    // Update customer's last_visit_at and points
    const updatedPoints = customer.points + parsed.data.points_earned;

    const { error: updateError } = await supabase
      .from("customers")
      .update({
        last_visit_at: new Date().toISOString(),
        points: updatedPoints,
      })
      .eq("id", parsed.data.customer_id)
      .eq("business_id", businessId);

    if (updateError) {
      return {
        success: false,
        error:
          "Visita guardada pero no se actualizaron los puntos del cliente.",
        message: null,
      };
    }

    return {
      success: true,
      error: null,
      message: "Visita registrada correctamente.",
    };
  } catch (err) {
    console.error("Error registering visit:", err);
    return {
      success: false,
      error: "Error interno al registrar la visita.",
      message: null,
    };
  }
}
