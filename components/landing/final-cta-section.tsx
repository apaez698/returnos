import Link from "next/link";

export function FinalCTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 px-6 py-20 sm:px-10 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-4xl text-center">
        {/* Headline */}
        <h2 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Empieza a fidelizar tus clientes hoy
        </h2>

        {/* Subtitle */}
        <p className="mt-6 text-lg text-white/90 sm:text-xl max-w-2xl mx-auto leading-relaxed">
          No necesitas instalar nada. Funciona desde tu tablet o computadora.
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
          {/* Primary Button */}
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-white text-orange-600 px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-bold transition-all hover:bg-slate-50 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-600 active:scale-95"
          >
            Crear cuenta gratis
          </Link>

          {/* Secondary Button */}
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-white/20 text-white px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-bold ring-2 ring-white/50 transition-all hover:bg-white/30 hover:ring-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-600 active:scale-95"
          >
            Iniciar sesión
          </Link>
        </div>

        {/* Subtext */}
        <p className="mt-8 text-sm text-white/75 font-medium">
          ✓ Prueba gratuita. Sin tarjeta de crédito.
        </p>
      </div>
    </section>
  );
}
