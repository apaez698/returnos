"use server";

import { redirect } from "next/navigation";
import { createServerAuthClient } from "@/lib/supabase/server";

export interface LogoutActionResult {
  success: boolean;
  error?: string;
}

/**
 * Server action to securely sign out the user.
 *
 * Calls supabase.auth.signOut() to clear the session,
 * and redirects to /login on success.
 *
 * On error, returns an error object (client component should
 * display to user). The client component should not redirect
 * if this returns an error.
 */
export async function logoutAction(): Promise<LogoutActionResult> {
  try {
    const supabase = await createServerAuthClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("[logout] Supabase sign out error:", error);
      return {
        success: false,
        error: "No se pudo cerrar la sesion. Por favor intenta nuevamente.",
      };
    }

    // Successful sign out — redirect to login.
    // Redirect throws after setting the response, so this doesn't return.
    redirect("/login");
  } catch (err) {
    // catch redirect exception — re-throw so navigation happens
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }

    console.error("[logout] Unexpected error:", err);
    return {
      success: false,
      error: "Se produjo un error inesperado. Por favor intenta nuevamente.",
    };
  }
}
