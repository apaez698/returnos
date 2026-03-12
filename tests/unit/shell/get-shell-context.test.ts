import { beforeEach, describe, expect, it, vi } from "vitest";
import { getShellContext } from "@/features/shell/queries/get-shell-context";
import { requireAuthenticatedBusinessContext } from "@/lib/auth/require-authenticated-business-context";

vi.mock("@/lib/auth/require-authenticated-business-context");
vi.mock("@/lib/business/business-branding", () => ({
  getBusinessTypeLabel: vi.fn((type: string) => {
    const labels: Record<string, string> = {
      bakery: "Panadería / Cafetería",
      restaurant: "Restaurante",
    };
    return labels[type] ?? type;
  }),
}));

describe("getShellContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves and returns complete shell context with all properties", async () => {
    vi.mocked(requireAuthenticatedBusinessContext).mockResolvedValue({
      userId: "user-123",
      userEmail: "owner@example.com",
      businessId: "biz-456",
      role: "owner",
      business: {
        id: "biz-456",
        name: "Panadería La Esperanza",
        slug: "panaderia-la-esperanza",
        business_type: "bakery",
        created_at: "2025-01-01T00:00:00Z",
      },
    });

    const context = await getShellContext();

    expect(context).toEqual({
      userId: "user-123",
      userEmail: "owner@example.com",
      businessId: "biz-456",
      businessName: "Panadería La Esperanza",
      businessType: "bakery",
      businessTypeLabel: "Panadería / Cafetería",
      role: "owner",
    });
  });

  it("resolves context with admin role", async () => {
    vi.mocked(requireAuthenticatedBusinessContext).mockResolvedValue({
      userId: "user-456",
      userEmail: "admin@example.com",
      businessId: "biz-789",
      role: "admin",
      business: {
        id: "biz-789",
        name: "El Buen Comer",
        slug: "el-buen-comer",
        business_type: "restaurant",
        created_at: "2025-01-01T00:00:00Z",
      },
    });

    const context = await getShellContext();

    expect(context.role).toBe("admin");
    expect(context.businessName).toBe("El Buen Comer");
    expect(context.businessTypeLabel).toBe("Restaurante");
  });

  it("resolves context with staff role", async () => {
    vi.mocked(requireAuthenticatedBusinessContext).mockResolvedValue({
      userId: "user-789",
      userEmail: "staff@example.com",
      businessId: "biz-123",
      role: "staff",
      business: {
        id: "biz-123",
        name: "Café Moderno",
        slug: "cafe-moderno",
        business_type: "bakery",
        created_at: "2025-01-01T00:00:00Z",
      },
    });

    const context = await getShellContext();

    expect(context.role).toBe("staff");
    expect(context.userEmail).toBe("staff@example.com");
  });

  it("handles unknown business types gracefully", async () => {
    vi.mocked(requireAuthenticatedBusinessContext).mockResolvedValue({
      userId: "user-999",
      userEmail: "user@example.com",
      businessId: "biz-999",
      role: "owner",
      business: {
        id: "biz-999",
        name: "Nuevo Negocio",
        slug: "nuevo-negocio",
        business_type: "unknown-type",
        created_at: "2025-01-01T00:00:00Z",
      },
    });

    const context = await getShellContext();

    expect(context.businessType).toBe("unknown-type");
    expect(context.businessTypeLabel).toBe("unknown-type");
  });

  it("preserves all context data exactly when delegating to requireAuthenticatedBusinessContext", async () => {
    const mockContext = {
      userId: "user-abc",
      userEmail: "test@returnos.io",
      businessId: "biz-xyz",
      role: null as const,
      business: {
        id: "biz-xyz",
        name: "Test Business",
        slug: "test-business",
        business_type: "bakery",
        created_at: "2025-02-01T10:30:00Z",
      },
    };

    vi.mocked(requireAuthenticatedBusinessContext).mockResolvedValue(
      mockContext,
    );

    const context = await getShellContext();

    expect(context.userId).toBe(mockContext.userId);
    expect(context.userEmail).toBe(mockContext.userEmail);
    expect(context.businessId).toBe(mockContext.businessId);
    expect(context.role).toBe(mockContext.role);
  });

  it("redirects to login when requireAuthenticatedBusinessContext redirects", async () => {
    const redirectError = new Error("NEXT_REDIRECT");
    vi.mocked(requireAuthenticatedBusinessContext).mockRejectedValue(
      redirectError,
    );

    await expect(getShellContext()).rejects.toEqual(redirectError);
  });

  it("throws when requireAuthenticatedBusinessContext throws for invalid membership", async () => {
    const resolveError = new Error(
      "No se pudo resolver una membresía activa para el usuario.",
    );
    vi.mocked(requireAuthenticatedBusinessContext).mockRejectedValue(
      resolveError,
    );

    await expect(getShellContext()).rejects.toEqual(resolveError);
  });

  it("includes business name in context even when it's empty string", async () => {
    vi.mocked(requireAuthenticatedBusinessContext).mockResolvedValue({
      userId: "user-edge",
      userEmail: "edge@example.com",
      businessId: "biz-edge",
      role: "owner",
      business: {
        id: "biz-edge",
        name: "",
        slug: "empty-name",
        business_type: "bakery",
        created_at: "2025-01-01T00:00:00Z",
      },
    });

    const context = await getShellContext();

    expect(context.businessName).toBe("");
  });
});
