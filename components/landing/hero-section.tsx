import { CTAButton } from "./cta-button";
import { LoyaltyCardMockup } from "./loyalty-card-mockup";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-orange-50 px-6 py-16 sm:px-10 lg:py-28">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-gradient-to-b from-orange-200/40 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-t from-amber-200/30 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left side - Content */}
          <div className="flex flex-col gap-8">
            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight text-zinc-950 sm:text-5xl lg:text-6xl">
                Convierte clientes ocasionales en{" "}
                <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  clientes recurrentes
                </span>
              </h1>

              <p className="text-base text-zinc-600 sm:text-lg leading-relaxed max-w-lg">
                Sistema de fidelización simple para panaderías, cafeterías y
                restaurantes. Registra compras, acumula puntos y haz que tus
                clientes regresen.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <CTAButton href="/signup">Probar gratis</CTAButton>
              <CTAButton href="/login" variant="secondary">
                Iniciar sesión
              </CTAButton>
            </div>

            {/* Trust indicator */}
            <div className="pt-4 border-t border-zinc-200/50">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                Usado por restaurantes en
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="text-sm font-semibold text-zinc-700">
                  🇲🇽 México
                </div>
                <div className="text-sm font-semibold text-zinc-700">
                  🇦🇷 Argentina
                </div>
                <div className="text-sm font-semibold text-zinc-700">
                  🇧🇷 Brasil
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Mockup (hidden on mobile) */}
          <div className="hidden lg:flex justify-center items-center">
            <LoyaltyCardMockup />
          </div>
        </div>

        {/* Mockup for mobile - shown below on smaller screens */}
        <div className="mt-16 flex lg:hidden justify-center">
          <LoyaltyCardMockup />
        </div>
      </div>
    </section>
  );
}
