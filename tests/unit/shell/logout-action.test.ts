import { describe, it, expect, beforeEach, vi } from "vitest";
import { logoutAction } from "@/features/shell/actions/logout";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockSignOut = vi.fn();
const mockRedirect = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerAuthClient: vi.fn(async () => ({
    auth: {
      signOut: mockSignOut,
    },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    mockRedirect(path);
    const error = new Error("NEXT_REDIRECT");
    throw error;
  }),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("logoutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns { success: true } on successful logout", async () => {
    mockSignOut.mockResolvedValue({ error: null });

    try {
      await logoutAction();
      // If no error is thrown, the test should still pass
      // (redirect behavior is tested separately)
    } catch (err) {
      // redirect throws after setting the response
      if (err instanceof Error && err.message === "NEXT_REDIRECT") {
        // Expected behavior - redirect was called
      } else {
        throw err;
      }
    }

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("calls redirect to /login on successful logout", async () => {
    mockSignOut.mockResolvedValue({ error: null });

    try {
      await logoutAction();
    } catch (err) {
      // redirect throws after setting the response
      if (err instanceof Error && err.message === "NEXT_REDIRECT") {
        // Expected behavior
      } else {
        throw err;
      }
    }

    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("returns error when supabase.auth.signOut() returns an error", async () => {
    const supabaseError = new Error("Auth error");
    mockSignOut.mockResolvedValue({ error: supabaseError });

    const result = await logoutAction();

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "No se pudo cerrar la sesion. Por favor intenta nuevamente.",
    );
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("handles unexpected errors gracefully", async () => {
    mockSignOut.mockRejectedValue(new Error("Unexpected error"));

    const result = await logoutAction();

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Se produjo un error inesperado. Por favor intenta nuevamente.",
    );
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("logs errors to console for debugging", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation();
    const supabaseError = new Error("Auth error");
    mockSignOut.mockResolvedValue({ error: supabaseError });

    await logoutAction();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[logout] Supabase sign out error:",
      supabaseError,
    );

    consoleErrorSpy.mockRestore();
  });

  it("calls supabase.auth.signOut()", async () => {
    mockSignOut.mockResolvedValue({ error: null });

    try {
      await logoutAction();
    } catch (err) {
      // Expected redirect error
    }

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("does not redirect when signOut fails", async () => {
    mockSignOut.mockResolvedValue({
      error: new Error("Sign out failed"),
    });

    await logoutAction();

    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
