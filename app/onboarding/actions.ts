"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBusinessOwnerSetup } from "@/lib/onboarding/create-business-owner-setup";
import { createBusinessOwnerInputSchema } from "@/lib/onboarding/onboarding-schema";
import {
  initialOnboardingActionState,
  type OnboardingActionState,
} from "@/lib/onboarding/types";
import { createServerAuthClient } from "@/lib/supabase/server";

export async function createBusinessOwnerAction(
  previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  void previousState;

  const supabase = await createServerAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Tu sesion ya no es valida. Inicia sesion nuevamente.",
    };
  }

  const parsed = createBusinessOwnerInputSchema.safeParse({
    businessName: String(formData.get("businessName") ?? ""),
    businessType: String(formData.get("businessType") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Revisa los datos de tu negocio.",
      fieldErrors: {
        businessName: fieldErrors.businessName?.[0],
        businessType: fieldErrors.businessType?.[0],
      },
    };
  }

  const result = await createBusinessOwnerSetup({
    userId: user.id,
    businessName: parsed.data.businessName,
    businessType: parsed.data.businessType,
  });

  if (!result.success) {
    return {
      status: "error",
      message: result.error ?? "No se pudo completar tu onboarding.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
