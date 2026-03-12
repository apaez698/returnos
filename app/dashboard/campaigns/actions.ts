"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import {
  initialCampaignActionState,
  type CampaignActionState,
} from "@/lib/campaigns/types";
import { createServerClient } from "@/lib/supabase/server";

const createCampaignSchema = z.object({
  name: z.string().trim().min(3, "El titulo debe tener al menos 3 caracteres."),
  message: z
    .string()
    .trim()
    .min(8, "El mensaje debe tener al menos 8 caracteres."),
  campaign_type: z.literal("reactivation"),
  audience_type: z.literal("inactive_customers"),
  target_inactive_days: z.coerce.number().int().min(1),
});

function getFieldError(
  fieldErrors: Record<string, string[] | undefined>,
  field: string,
): string | undefined {
  return fieldErrors[field]?.[0];
}

export async function createCampaignAction(
  previousState: CampaignActionState = initialCampaignActionState,
  formData: FormData,
): Promise<CampaignActionState> {
  void previousState;

  const parsed = createCampaignSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    message: String(formData.get("message") ?? ""),
    campaign_type: String(formData.get("campaign_type") ?? ""),
    audience_type: String(formData.get("audience_type") ?? ""),
    target_inactive_days: formData.get("target_inactive_days"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Revisa los datos de la campana.",
      fieldErrors: {
        name: getFieldError(fieldErrors, "name"),
        message: getFieldError(fieldErrors, "message"),
      },
    };
  }

  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const { error } = await supabase.from("campaigns").insert({
    business_id: businessId,
    name: parsed.data.name,
    message: parsed.data.message,
    campaign_type: parsed.data.campaign_type,
    audience_type: parsed.data.audience_type,
    target_inactive_days: parsed.data.target_inactive_days,
    status: "draft",
  });

  if (error) {
    return {
      status: "error",
      message: "No se pudo guardar la campana en Supabase.",
    };
  }

  revalidatePath("/dashboard/campaigns");

  return {
    status: "success",
    message: "Campana creada correctamente.",
  };
}
