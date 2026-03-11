"use server";

import { revalidatePath } from "next/cache";
import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import {
  createRewardRuleSchema,
  updateRewardRuleSchema,
} from "@/lib/rewards/schema";
import {
  RewardActionState,
  initialRewardActionState,
} from "@/lib/rewards/types";
import { createServerClient } from "@/lib/supabase/server";

export type CreateRewardRuleResult = {
  success: boolean;
  error: string | null;
  message: string | null;
};

export type RedeemRewardResult = {
  success: boolean;
  error: string | null;
  message: string | null;
};

export async function insertRewardRuleAction(
  input: unknown,
): Promise<CreateRewardRuleResult> {
  const parsed = createRewardRuleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Revisa los datos de la recompensa.",
      message: null,
    };
  }

  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const { error } = await supabase.from("reward_rules").insert({
    business_id: businessId,
    name: parsed.data.name,
    points_required: parsed.data.points_required,
    reward_description: parsed.data.reward_description,
    is_active: parsed.data.is_active,
  });

  if (error) {
    return {
      success: false,
      error: "No se pudo guardar la regla de recompensa.",
      message: null,
    };
  }

  revalidatePath("/dashboard/rewards");

  return {
    success: true,
    error: null,
    message: "Regla de recompensa creada exitosamente.",
  };
}

/**
 * Create a new reward rule for the current business.
 */
export async function createRewardRuleAction(
  previousState: RewardActionState,
  formData: FormData,
): Promise<RewardActionState> {
  try {
    // Parse form data
    const input = {
      name: formData.get("name"),
      points_required: formData.get("points_required")
        ? parseInt(formData.get("points_required") as string, 10)
        : undefined,
      reward_description: formData.get("reward_description"),
      is_active: formData.get("is_active") === "on",
    };

    // Validate input
    const parsed = createRewardRuleSchema.safeParse(input);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const mappedErrors: Record<string, string> = {};

      for (const [key, errors] of Object.entries(fieldErrors)) {
        if (errors?.[0]) {
          mappedErrors[key] = errors[0];
        }
      }

      return {
        status: "error",
        message: "Hay errores en el formulario.",
        fieldErrors: mappedErrors,
      };
    }

    const result = await insertRewardRuleAction(parsed.data);

    if (!result.success) {
      return {
        status: "error",
        message: result.error ?? "No se pudo guardar la regla de recompensa.",
      };
    }

    return {
      status: "success",
      message: result.message ?? "Regla de recompensa creada exitosamente.",
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        status: "error",
        message: err.message,
      };
    }
    return {
      status: "error",
      message: "Ocurrió un error inesperado.",
    };
  }
}

/**
 * Update an existing reward rule.
 */
export async function updateRewardRuleAction(
  previousState: RewardActionState,
  formData: FormData,
): Promise<RewardActionState> {
  try {
    // Parse form data
    const input = {
      id: formData.get("id"),
      name: formData.get("name"),
      points_required: formData.get("points_required")
        ? parseInt(formData.get("points_required") as string, 10)
        : undefined,
      reward_description: formData.get("reward_description"),
      is_active: formData.get("is_active") === "on",
    };

    // Validate input
    const parsed = updateRewardRuleSchema.safeParse(input);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const mappedErrors: Record<string, string> = {};

      for (const [key, errors] of Object.entries(fieldErrors)) {
        if (errors?.[0]) {
          mappedErrors[key] = errors[0];
        }
      }

      return {
        status: "error",
        message: "Hay errores en el formulario.",
        fieldErrors: mappedErrors,
      };
    }

    const businessId = await getCurrentBusinessId();
    const supabase = createServerClient();

    // Verify rule belongs to business
    const { data: existing, error: checkError } = await supabase
      .from("reward_rules")
      .select("id")
      .eq("id", parsed.data.id)
      .eq("business_id", businessId)
      .limit(1)
      .maybeSingle();

    if (checkError || !existing) {
      return {
        status: "error",
        message: "Regla de recompensa no encontrada.",
      };
    }

    // Update reward rule
    const { error: updateError } = await supabase
      .from("reward_rules")
      .update({
        name: parsed.data.name,
        points_required: parsed.data.points_required,
        reward_description: parsed.data.reward_description,
        is_active: parsed.data.is_active,
      })
      .eq("id", parsed.data.id)
      .eq("business_id", businessId);

    if (updateError) {
      return {
        status: "error",
        message: "No se pudo actualizar la regla de recompensa.",
      };
    }

    return {
      status: "success",
      message: "Regla de recompensa actualizada exitosamente.",
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        status: "error",
        message: err.message,
      };
    }
    return {
      status: "error",
      message: "Ocurrió un error inesperado.",
    };
  }
}

/**
 * Toggle the active status of a reward rule.
 */
export async function toggleRewardRuleAction(
  ruleId: string,
): Promise<RewardActionState> {
  try {
    const businessId = await getCurrentBusinessId();
    const supabase = createServerClient();

    // Get current state
    const { data: rule, error: getError } = await supabase
      .from("reward_rules")
      .select("is_active")
      .eq("id", ruleId)
      .eq("business_id", businessId)
      .limit(1)
      .maybeSingle();

    if (getError || !rule) {
      return {
        status: "error",
        message: "Regla de recompensa no encontrada.",
      };
    }

    // Toggle
    const { error: updateError } = await supabase
      .from("reward_rules")
      .update({ is_active: !rule.is_active })
      .eq("id", ruleId);

    if (updateError) {
      return {
        status: "error",
        message: "No se pudo actualizar la regla de recompensa.",
      };
    }

    return {
      status: "success",
      message: rule.is_active ? "Regla desactivada." : "Regla activada.",
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        status: "error",
        message: err.message,
      };
    }
    return {
      status: "error",
      message: "Ocurrió un error inesperado.",
    };
  }
}

/**
 * Delete a reward rule.
 */
export async function deleteRewardRuleAction(
  ruleId: string,
): Promise<RewardActionState> {
  try {
    const businessId = await getCurrentBusinessId();
    const supabase = createServerClient();

    // Verify rule exists and belongs to business
    const { data: rule, error: checkError } = await supabase
      .from("reward_rules")
      .select("id")
      .eq("id", ruleId)
      .eq("business_id", businessId)
      .limit(1)
      .maybeSingle();

    if (checkError || !rule) {
      return {
        status: "error",
        message: "Regla de recompensa no encontrada.",
      };
    }

    // Delete
    const { error: deleteError } = await supabase
      .from("reward_rules")
      .delete()
      .eq("id", ruleId);

    if (deleteError) {
      return {
        status: "error",
        message: "No se pudo eliminar la regla de recompensa.",
      };
    }

    return {
      status: "success",
      message: "Regla de recompensa eliminada exitosamente.",
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        status: "error",
        message: err.message,
      };
    }
    return {
      status: "error",
      message: "Ocurrió un error inesperado.",
    };
  }
}

export async function redeemRewardAction(
  previousState: RedeemRewardResult,
  formData: FormData,
): Promise<RedeemRewardResult> {
  void previousState;

  const customerId = String(formData.get("customer_id") ?? "").trim();
  const rewardRuleId = String(formData.get("reward_rule_id") ?? "").trim();

  if (!customerId || !rewardRuleId) {
    return {
      success: false,
      error: "Faltan datos para canjear la recompensa.",
      message: null,
    };
  }

  try {
    const businessId = await getCurrentBusinessId();
    const supabase = createServerClient();

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, points")
      .eq("id", customerId)
      .eq("business_id", businessId)
      .limit(1)
      .maybeSingle();

    if (customerError || !customer) {
      return {
        success: false,
        error: "Cliente no encontrado.",
        message: null,
      };
    }

    const { data: rewardRule, error: rewardError } = await supabase
      .from("reward_rules")
      .select("id, name, points_required, is_active")
      .eq("id", rewardRuleId)
      .eq("business_id", businessId)
      .limit(1)
      .maybeSingle();

    if (rewardError || !rewardRule || !rewardRule.is_active) {
      return {
        success: false,
        error: "Recompensa no disponible.",
        message: null,
      };
    }

    if (customer.points < rewardRule.points_required) {
      return {
        success: false,
        error: "El cliente ya no tiene puntos suficientes.",
        message: null,
      };
    }

    const { data: redemption, error: redemptionError } = await supabase
      .from("reward_redemptions")
      .insert({
        business_id: businessId,
        customer_id: customerId,
        reward_rule_id: rewardRuleId,
        points_spent: rewardRule.points_required,
      })
      .select("id")
      .limit(1)
      .maybeSingle();

    if (redemptionError || !redemption) {
      return {
        success: false,
        error: "No se pudo registrar el canje.",
        message: null,
      };
    }

    const pointsAfterRedemption = customer.points - rewardRule.points_required;

    const { data: updatedCustomer, error: updateError } = await supabase
      .from("customers")
      .update({ points: pointsAfterRedemption })
      .eq("id", customerId)
      .eq("business_id", businessId)
      .gte("points", rewardRule.points_required)
      .select("id")
      .limit(1)
      .maybeSingle();

    if (updateError || !updatedCustomer) {
      await supabase
        .from("reward_redemptions")
        .delete()
        .eq("id", redemption.id);

      return {
        success: false,
        error: "No se pudieron descontar los puntos del cliente.",
        message: null,
      };
    }

    revalidatePath("/dashboard/rewards");
    revalidatePath("/dashboard/customers");

    return {
      success: true,
      error: null,
      message: `Recompensa canjeada: ${rewardRule.name}.`,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        message: null,
      };
    }

    return {
      success: false,
      error: "Ocurrió un error inesperado.",
      message: null,
    };
  }
}
