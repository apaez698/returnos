import Link from "next/link";
import { CTAButton } from "./cta-button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200/50 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-orange-700">
            <span className="text-sm font-bold text-white">R</span>
          </div>
          <span className="hidden font-bold tracking-tight text-zinc-900 sm:inline">
            ReturnOS
          </span>
        </Link>

        {/* Center Navigation - Hidden on mobile */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-zinc-700 transition-colors hover:text-orange-600"
          >
            Cómo funciona
          </Link>
          <Link
            href="#benefits"
            className="text-sm font-medium text-zinc-700 transition-colors hover:text-orange-600"
          >
            Beneficios
          </Link>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-300 transition-colors hover:bg-zinc-50 sm:inline-flex"
          >
            Iniciar sesión
          </Link>
          <CTAButton href="/signup">Crear cuenta</CTAButton>
        </div>
      </div>
    </nav>
  );
}
