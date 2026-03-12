"use client";

import { useState } from "react";
import { logoutAction } from "@/features/shell/actions/logout";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    // Prevent double-clicks
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await logoutAction();

      if (!result.success) {
        setError(result.error || "Error desconocido");
        setIsLoading(false);
      }
      // On success, logoutAction redirects, so we don't need to do anything here
    } catch (err) {
      console.error("[LogoutButton] Unexpected error:", err);
      setError("Se produjo un error inesperado");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="text-sm text-slate-400 hover:text-white transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isLoading ? "Cerrando sesión..." : "Cerrar sesión"}
      >
        {isLoading ? "Cerrando sesión..." : "Cerrar sesión"}
      </button>
      {error && (
        <div className="text-xs text-red-500" role="alert" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
}
