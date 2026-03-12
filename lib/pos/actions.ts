"use server";

import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { getPurchaseSummary } from "@/lib/pos/calculations";
import { posPurchaseSchema } from "@/lib/pos/schemas";
import { createServerClient } from "@/lib/supabase/server";

export type RegisterPosPurchaseResult = {
  success: boolean;
  error: string | null;
  message: string | null;
  pointsEarned: number;
  updatedPoints: number;
};

export async function registerPosPurchase(
  input: unknown,
): Promise<RegisterPosPurchaseResult> {
  const parsed = posPurchaseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Datos de compra inválidos.",
      message: null,
      pointsEarned: 0,
      updatedPoints: 0,
    };
  }

  try {
    const businessId = await getCurrentBusinessId();
    const supabase = createServerClient();

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
        pointsEarned: 0,
        updatedPoints: 0,
      };
    }

    const { pointsEarned, updatedPoints } = getPurchaseSummary(
      customer.points,
      parsed.data.amount,
    );

    const { error: insertVisitError } = await supabase.from("visits").insert({
      business_id: businessId,
      customer_id: customer.id,
      points_earned: pointsEarned,
      amount: parsed.data.amount,
      source: "in_store",
    });

    if (insertVisitError) {
      return {
        success: false,
        error: "No se pudo registrar la compra.",
        message: null,
        pointsEarned,
        updatedPoints: customer.points,
      };
    }

    const { error: updateCustomerError } = await supabase
      .from("customers")
      .update({
        points: updatedPoints,
        last_visit_at: new Date().toISOString(),
      })
      .eq("id", customer.id)
      .eq("business_id", businessId);

    if (updateCustomerError) {
      return {
        success: false,
        error:
          "Compra registrada, pero no se pudieron actualizar los datos del cliente.",
        message: null,
        pointsEarned,
        updatedPoints: customer.points,
      };
    }

    return {
      success: true,
      error: null,
      message: "Compra registrada correctamente.",
      pointsEarned,
      updatedPoints,
    };
  } catch (err) {
    console.error("Error registering POS purchase:", err);
    return {
      success: false,
      error: "Error interno al registrar la compra.",
      message: null,
      pointsEarned: 0,
      updatedPoints: 0,
    };
  }
}
