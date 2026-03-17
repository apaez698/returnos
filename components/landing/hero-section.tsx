import { CTAButton } from "./cta-button";
import { LoyaltyCardMockup } from "./loyalty-card-mockup";

const WHATSAPP_LINK =
  "https://wa.me/<YOUR_NUMBER>?text=Hola%2C%20%C2%BFme%20explicas%20la%20demo%20de%20ReturnOS%20en%202%20minutos%3F";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 11.8C20 16.2 16.4 19.8 12 19.8C10.7 19.8 9.4 19.5 8.3 18.9L4.8 19.8L5.7 16.4C5 15.1 4.6 13.5 4.6 11.8C4.6 7.4 8.2 3.8 12.6 3.8C17 3.8 20 7.4 20 11.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 9.1C9.5 8.8 9.8 8.8 10 9C10.3 9.2 11 10 11.1 10.2C11.2 10.4 11.2 10.6 11.1 10.8C11 11 10.8 11.1 10.7 11.2C10.6 11.3 10.5 11.4 10.6 11.6C10.7 11.9 11 12.4 11.5 12.8C12 13.3 12.5 13.6 12.8 13.7C13 13.8 13.1 13.7 13.2 13.6C13.3 13.5 13.4 13.3 13.5 13.2C13.7 13 13.9 13 14.1 13.1C14.3 13.2 15.2 13.8 15.5 14C15.7 14.2 15.7 14.5 15.6 14.8C15.4 15.2 15.1 15.4 14.7 15.6C14.4 15.7 14 15.8 13.5 15.7C12.9 15.6 12.2 15.4 11.4 14.9C10.6 14.4 9.8 13.8 9.2 13C8.7 12.3 8.4 11.6 8.3 10.9C8.2 10.2 8.5 9.6 9.2 9.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

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
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50/80 px-3 py-1 text-xs font-medium text-orange-700">
                <span aria-hidden="true">🚀</span>
                Configuración en menos de 5 minutos
              </p>

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
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <CTAButton href="/signup">
                  Empieza gratis en 2 minutos
                </CTAButton>
                <CTAButton href="/login" variant="secondary">
                  Iniciar sesión
                </CTAButton>
              </div>

              <p className="text-sm font-medium text-zinc-700">
                Empieza hoy y activa tu sistema de fidelización en minutos
              </p>

              <div className="inline-flex flex-col items-start gap-2 rounded-2xl border border-[#25D366]/25 bg-[#25D366]/5 px-4 py-3">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Hablar con asesor por WhatsApp"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-white px-4 text-sm font-semibold text-[#1E7A43] transition-all hover:-translate-y-0.5 hover:border-[#25D366]/70 hover:bg-[#25D366]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366]/15">
                    <WhatsAppIcon className="h-4 w-4" />
                  </span>
                  <span>Habla con un asesor en 2 min</span>
                </a>
                <p className="text-xs text-zinc-600">
                  Te guiamos paso a paso para empezar hoy
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-600">
              No necesitas tarjeta. Empieza hoy mismo.
            </p>
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
