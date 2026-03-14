"use server";

import { revalidatePath } from "next/cache";
import {
  createCustomerForCurrentBusiness,
  CreatedCustomerRecord,
} from "@/lib/customers/create-service";
import { createCustomerSchema } from "@/lib/customers/schema";
import {
  CustomerActionState,
  initialCustomerActionState,
} from "@/lib/customers/types";

export type CreateCustomerResult = {
  success: boolean;
  error: string | null;
  customer: CreatedCustomerRecord | null;
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
  const result = await createCustomerForCurrentBusiness(input);

  if (!result.success) {
    return result;
  }

  revalidatePath("/dashboard/customers");

  return result;
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
