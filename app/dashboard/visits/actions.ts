"use server";

import { revalidatePath } from "next/cache";
import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { createVisitSchema } from "@/lib/visits/schema";
import { initialVisitActionState, VisitActionState } from "@/lib/visits/types";
import { createServerClient } from "@/lib/supabase/server";

function getFieldError(
  fieldErrors: Record<string, string[] | undefined>,
  field: string,
): string | undefined {
  return fieldErrors[field]?.[0];
}

export async function createVisitAction(
  previousState: VisitActionState = initialVisitActionState,
  formData: FormData,
): Promise<VisitActionState> {
  void previousState;

  const rawPoints = Number(String(formData.get("points_earned") ?? ""));
  const rawAmount = String(formData.get("amount") ?? "").trim();

  const parsed = createVisitSchema.safeParse({
    customer_id: String(formData.get("customer_id") ?? ""),
    points_earned: rawPoints,
    amount: rawAmount.length === 0 ? undefined : Number(rawAmount),
    product_category: String(formData.get("product_category") ?? ""),
    source: String(formData.get("source") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Revisa los datos de la visita.",
      fieldErrors: {
        customer_id: getFieldError(fieldErrors, "customer_id"),
        points_earned: getFieldError(fieldErrors, "points_earned"),
        amount: getFieldError(fieldErrors, "amount"),
        product_category: getFieldError(fieldErrors, "product_category"),
        source: getFieldError(fieldErrors, "source"),
      },
    };
  }

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
      status: "error",
      message: "No se encontro el cliente seleccionado.",
    };
  }

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
      status: "error",
      message: "No se pudo guardar la visita. Intenta de nuevo.",
    };
  }

  const updatedPoints = customer.points + parsed.data.points_earned;

  const { error: updateCustomerError } = await supabase
    .from("customers")
    .update({
      last_visit_at: new Date().toISOString(),
      points: updatedPoints,
    })
    .eq("id", parsed.data.customer_id)
    .eq("business_id", businessId);

  if (updateCustomerError) {
    return {
      status: "error",
      message:
        "La visita se guardo, pero no se pudieron actualizar los puntos del cliente.",
    };
  }

  revalidatePath("/dashboard/visits");
  revalidatePath("/dashboard/customers");

  return {
    status: "success",
    message: "Visita registrada correctamente.",
  };
}
