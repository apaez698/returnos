"use server";

import { revalidatePath } from "next/cache";
import { createCustomerForCurrentBusiness } from "@/lib/customers/create-service";
import {
  initialPosCreateCustomerActionState,
  PosCreateCustomerActionState,
} from "@/lib/pos/types";

export async function createPosCustomerInlineAction(
  previousState: PosCreateCustomerActionState = initialPosCreateCustomerActionState,
  formData: FormData,
): Promise<PosCreateCustomerActionState> {
  void previousState;

  const result = await createCustomerForCurrentBusiness({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: "",
    birthday: "",
    consent_marketing: false,
  });

  if (!result.success || !result.customer) {
    if (result.errorCode === "validation") {
      return {
        status: "error",
        message: result.error ?? "Revisa los datos del cliente.",
        fieldErrors: {
          name: result.fieldErrors?.name,
          phone: result.fieldErrors?.phone,
        },
      };
    }

    if (result.errorCode === "duplicate") {
      return {
        status: "error",
        message: result.error ?? "Ya existe un cliente con ese telefono.",
        fieldErrors: {
          phone: result.error ?? "Ya existe un cliente con ese telefono.",
        },
      };
    }

    return {
      status: "error",
      message: result.error ?? "No se pudo guardar el cliente.",
    };
  }

  revalidatePath("/dashboard/caja");
  revalidatePath("/dashboard/customers");

  return {
    status: "success",
    message: "Cliente creado correctamente.",
    customer: result.customer,
  };
}
