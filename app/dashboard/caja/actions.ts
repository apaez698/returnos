"use server";

import { revalidatePath } from "next/cache";
import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import {
  findNewlyUnlockedReward,
  getPurchaseSummary,
} from "@/lib/pos/calculations";
import {
  getActiveRewardThresholdsForCurrentBusiness,
  searchPosCustomersForCurrentBusiness,
} from "@/lib/pos/queries";
import { posPurchaseSchema } from "@/lib/pos/schemas";
import {
  initialPosPurchaseActionState,
  PosCustomer,
  PosPurchaseActionState,
} from "@/lib/pos/types";
import { createServerClient } from "@/lib/supabase/server";

function getFieldError(
  fieldErrors: Record<string, string[] | undefined>,
  field: string,
): string | undefined {
  return fieldErrors[field]?.[0];
}

export async function searchPosCustomersAction(
  rawQuery: string,
): Promise<PosCustomer[]> {
  const safeQuery = rawQuery.slice(0, 80);

  try {
    return await searchPosCustomersForCurrentBusiness(safeQuery, 8);
  } catch {
    return [];
  }
}

export async function registerPosPurchaseAction(
  previousState: PosPurchaseActionState = initialPosPurchaseActionState,
  formData: FormData,
): Promise<PosPurchaseActionState> {
  void previousState;

  const rawAmount = Number(String(formData.get("amount") ?? ""));

  const parsed = posPurchaseSchema.safeParse({
    customer_id: String(formData.get("customer_id") ?? ""),
    amount: rawAmount,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Revisa los datos de la compra.",
      fieldErrors: {
        customer_id: getFieldError(fieldErrors, "customer_id"),
        amount: getFieldError(fieldErrors, "amount"),
      },
    };
  }

  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, name, points")
    .eq("id", parsed.data.customer_id)
    .eq("business_id", businessId)
    .limit(1)
    .maybeSingle();

  if (customerError || !customer) {
    return {
      status: "error",
      message: "No se encontró el cliente seleccionado.",
    };
  }

  const purchaseSummary = getPurchaseSummary(
    customer.points,
    parsed.data.amount,
  );
  const { pointsEarned, updatedPoints } = purchaseSummary;

  const { error: insertVisitError } = await supabase.from("visits").insert({
    business_id: businessId,
    customer_id: customer.id,
    points_earned: pointsEarned,
    amount: parsed.data.amount,
    source: "in_store",
  });

  if (insertVisitError) {
    return {
      status: "error",
      message: "No se pudo registrar la compra. Intenta de nuevo.",
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
      status: "error",
      message:
        "La compra se registró, pero no se pudieron actualizar los puntos del cliente.",
    };
  }

  let unlockedRewardName: string | null = null;

  try {
    const rewardThresholds =
      await getActiveRewardThresholdsForCurrentBusiness();
    const unlockedReward = findNewlyUnlockedReward(
      customer.points,
      updatedPoints,
      rewardThresholds,
    );
    unlockedRewardName = unlockedReward?.name ?? null;
  } catch {
    unlockedRewardName = null;
  }

  revalidatePath("/dashboard/caja");
  revalidatePath("/dashboard/visits");
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/rewards");

  return {
    status: "success",
    message: "Compra registrada correctamente.",
    receipt: {
      customerId: customer.id,
      customerName: customer.name,
      amount: parsed.data.amount,
      pointsEarned,
      updatedPoints,
      unlockedRewardName,
    },
  };
}
