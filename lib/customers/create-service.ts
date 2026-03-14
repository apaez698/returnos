import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { createCustomerSchema } from "@/lib/customers/schema";
import { createServerClient } from "@/lib/supabase/server";

export interface CreatedCustomerRecord {
  id: string;
  name: string;
  phone: string;
  points: number;
  last_visit_at: string | null;
}

export type CreateCustomerServiceErrorCode =
  | "validation"
  | "duplicate"
  | "lookup_failed"
  | "insert_failed";

export interface CreateCustomerServiceFieldErrors {
  name?: string;
  phone?: string;
  email?: string;
  birthday?: string;
}

export interface CreateCustomerServiceResult {
  success: boolean;
  error: string | null;
  errorCode: CreateCustomerServiceErrorCode | null;
  fieldErrors?: CreateCustomerServiceFieldErrors;
  customer: CreatedCustomerRecord | null;
}

type LoggableSupabaseError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  constraint?: string;
};

function extractSupabaseErrorMeta(
  error: unknown,
): LoggableSupabaseError | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const candidate = error as Record<string, unknown>;

  return {
    message:
      typeof candidate.message === "string" ? candidate.message : undefined,
    code: typeof candidate.code === "string" ? candidate.code : undefined,
    details:
      typeof candidate.details === "string" ? candidate.details : undefined,
    hint: typeof candidate.hint === "string" ? candidate.hint : undefined,
    constraint:
      typeof candidate.constraint === "string"
        ? candidate.constraint
        : undefined,
  };
}

export async function createCustomerForCurrentBusiness(
  input: unknown,
): Promise<CreateCustomerServiceResult> {
  const parsed = createCustomerSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      error: "Revisa los datos del cliente.",
      errorCode: "validation",
      fieldErrors: {
        name: fieldErrors.name?.[0],
        phone: fieldErrors.phone?.[0],
        email: fieldErrors.email?.[0],
        birthday: fieldErrors.birthday?.[0],
      },
      customer: null,
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
    const errorMeta = extractSupabaseErrorMeta(findError);
    console.error(
      "[customers.service.create] Error en validacion de cliente existente",
      {
        error: findError,
        message: errorMeta?.message,
        code: errorMeta?.code,
        constraint: errorMeta?.constraint,
        details: errorMeta?.details,
        hint: errorMeta?.hint,
      },
    );

    return {
      success: false,
      error: "No se pudo validar si el cliente ya existe.",
      errorCode: "lookup_failed",
      customer: null,
    };
  }

  if (existingCustomer) {
    return {
      success: false,
      error: "Ya existe un cliente con ese telefono en este negocio.",
      errorCode: "duplicate",
      customer: null,
    };
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      business_id: businessId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email ?? null,
      birthday: parsed.data.birthday ?? null,
      consent_marketing: parsed.data.consent_marketing,
    })
    .select("id, name, phone, points, last_visit_at")
    .single();

  if (error) {
    const errorMeta = extractSupabaseErrorMeta(error);
    console.error("[customers.service.create] Error en insert", {
      error,
      message: errorMeta?.message,
      code: errorMeta?.code,
      constraint: errorMeta?.constraint,
      details: errorMeta?.details,
      hint: errorMeta?.hint,
    });

    if (error.code === "23505") {
      return {
        success: false,
        error: "Ya existe un cliente con ese telefono en este negocio.",
        errorCode: "duplicate",
        customer: null,
      };
    }

    return {
      success: false,
      error: "No se pudo guardar el cliente. Intenta de nuevo.",
      errorCode: "insert_failed",
      customer: null,
    };
  }

  return {
    success: true,
    error: null,
    errorCode: null,
    customer: {
      id: data.id,
      name: data.name,
      phone: data.phone,
      points: data.points,
      last_visit_at: data.last_visit_at,
    },
  };
}
