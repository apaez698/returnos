"use client";

import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export function LogoutButton() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-slate-400 hover:text-white transition-colors text-left"
    >
      Cerrar sesión
    </button>
  );
}
