"use server";

import { revalidatePath } from "next/cache";
import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { createCustomerSchema } from "@/lib/customers/schema";
import {
  CustomerActionState,
  initialCustomerActionState,
} from "@/lib/customers/types";
import { createServerClient } from "@/lib/supabase/server";

export type CreateCustomerResult = {
  success: boolean;
  error: string | null;
};

function getFieldError(
  fieldErrors: Record<string, string[] | undefined>,
  field: string,
): string | undefined {
  return fieldErrors[field]?.[0];
}

export async function insertCustomerAction(
  input: unknown,
): Promise<CreateCustomerResult> {
  const parsed = createCustomerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Revisa los datos del cliente.",
    };
  }

  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const { data: existingCustomer, error: findError } = await supabase
    .from("customers")
    .select("id")
    .eq("business_id", businessId)
    .eq("phone", parsed.data.phone)
    .limit(1)
    .maybeSingle();

  if (findError) {
    return {
      success: false,
      error: "No se pudo validar si el cliente ya existe.",
    };
  }

  if (existingCustomer) {
    return {
      success: false,
      error: "Ya existe un cliente con ese telefono en este negocio.",
    };
  }

  const { error } = await supabase.from("customers").insert({
    business_id: businessId,
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
        error: "Ya existe un cliente con ese telefono en este negocio.",
      };
    }

    return {
      success: false,
      error: "No se pudo guardar el cliente. Intenta de nuevo.",
    };
  }

  revalidatePath("/dashboard/customers");

  return {
    success: true,
    error: null,
  };
}

export async function createCustomerAction(
  previousState: CustomerActionState = initialCustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  void previousState;

  const parsed = createCustomerSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    birthday: String(formData.get("birthday") ?? ""),
    consent_marketing: formData.get("consent_marketing") === "on",
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Revisa los datos del formulario.",
      fieldErrors: {
        name: getFieldError(fieldErrors, "name"),
        phone: getFieldError(fieldErrors, "phone"),
        email: getFieldError(fieldErrors, "email"),
        birthday: getFieldError(fieldErrors, "birthday"),
      },
    };
  }

  const result = await insertCustomerAction({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    birthday: parsed.data.birthday,
    consent_marketing: parsed.data.consent_marketing,
  });

  if (!result.success) {
    return {
      status: "error",
      message:
        result.error ?? "No se pudo guardar el cliente. Intenta de nuevo.",
    };
  }

  return {
    status: "success",
    message: "Cliente creado correctamente.",
  };
}
