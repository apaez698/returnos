import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPosCustomerInlineAction } from "@/app/dashboard/caja/create-customer-inline";
import {
  createCustomerForCurrentBusiness,
  type CreateCustomerServiceResult,
} from "@/lib/customers/create-service";
import {
  initialPosCreateCustomerActionState,
  type PosCreateCustomerActionState,
} from "@/lib/pos/types";

vi.mock("@/lib/customers/create-service", () => ({
  createCustomerForCurrentBusiness: vi.fn(),
}));

const mockRevalidatePath = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

function buildFormData(name: string, phone: string): FormData {
  const formData = new FormData();
  formData.set("name", name);
  formData.set("phone", phone);
  return formData;
}

describe("createPosCustomerInlineAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps validation errors from the shared service to fieldErrors", async () => {
    vi.mocked(createCustomerForCurrentBusiness).mockResolvedValue({
      success: false,
      error: "Revisa los datos del cliente.",
      errorCode: "validation",
      fieldErrors: {
        name: "Ingresa un nombre valido.",
        phone: "Ingresa un telefono valido.",
      },
      customer: null,
    } satisfies CreateCustomerServiceResult);

    const result = await createPosCustomerInlineAction(
      initialPosCreateCustomerActionState,
      buildFormData("", ""),
    );

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/revisa los datos/i);
    expect(result.fieldErrors?.name).toMatch(/nombre/i);
    expect(result.fieldErrors?.phone).toMatch(/telefono/i);
  });

  it("maps duplicate errors to phone field for inline UX", async () => {
    vi.mocked(createCustomerForCurrentBusiness).mockResolvedValue({
      success: false,
      error: "Ya existe un cliente con ese telefono en este negocio.",
      errorCode: "duplicate",
      customer: null,
    } satisfies CreateCustomerServiceResult);

    const result = await createPosCustomerInlineAction(
      initialPosCreateCustomerActionState,
      buildFormData("Ana", "+521111111111"),
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.phone).toMatch(/ya existe un cliente/i);
  });

  it("returns generic action error when service fails unexpectedly", async () => {
    vi.mocked(createCustomerForCurrentBusiness).mockResolvedValue({
      success: false,
      error: "No se pudo guardar el cliente. Intenta de nuevo.",
      errorCode: "insert_failed",
      customer: null,
    } satisfies CreateCustomerServiceResult);

    const result = await createPosCustomerInlineAction(
      initialPosCreateCustomerActionState,
      buildFormData("Ana", "+521999999999"),
    );

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/no se pudo guardar el cliente/i);
    expect(result.fieldErrors).toBeUndefined();
  });

  it("returns success, customer payload and revalidates pages", async () => {
    vi.mocked(createCustomerForCurrentBusiness).mockResolvedValue({
      success: true,
      error: null,
      errorCode: null,
      customer: {
        id: "customer-new",
        name: "Cliente Nuevo",
        phone: "+521234000999",
        points: 0,
        last_visit_at: null,
      },
    } satisfies CreateCustomerServiceResult);

    const result: PosCreateCustomerActionState =
      await createPosCustomerInlineAction(
        initialPosCreateCustomerActionState,
        buildFormData("Cliente Nuevo", "+521234000999"),
      );

    expect(result.status).toBe("success");
    expect(result.customer?.id).toBe("customer-new");
    expect(result.customer?.name).toBe("Cliente Nuevo");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/caja");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/customers");
  });
});
