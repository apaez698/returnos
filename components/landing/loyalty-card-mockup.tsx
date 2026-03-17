export function LoyaltyCardMockup() {
  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Card Container */}
      <div className="relative h-64 rounded-2xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 p-6 shadow-2xl">
        {/* Top Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-orange-100 uppercase">
              Tarjeta de Fidelización
            </p>
            <p className="mt-2 text-lg font-bold text-white">Mi Panadería</p>
          </div>
          <div className="text-2xl font-bold text-orange-100">★</div>
        </div>

        {/* Points Display */}
        <div className="mb-6 rounded-xl bg-white/20 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium text-orange-100">
            Puntos acumulados
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">2,450</span>
            <span className="text-sm text-orange-100">pts</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-orange-100">
            Falta para próxima recompensa
          </p>
          <div className="h-2 w-full rounded-full bg-white/20">
            <div className="h-full w-2/3 rounded-full bg-white/80"></div>
          </div>
          <p className="text-xs text-orange-100">1,550 pts para café gratis</p>
        </div>
      </div>

      {/* QR Code Mockup */}
      <div className="mt-6 flex justify-center">
        <div className="relative h-32 w-32 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 p-2 shadow-lg">
          <div className="grid h-full grid-cols-4 gap-0.5 bg-white">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-sm ${
                  Math.random() > 0.4 ? "bg-zinc-900" : "bg-white"
                }`}
              />
            ))}
          </div>
          <div className="absolute inset-0 rounded-lg border border-zinc-300" />
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-4 rounded-full bg-green-50 px-4 py-2 text-center">
        <p className="text-xs font-semibold text-green-700">
          ✓ Tarjeta activa y verificada
        </p>
      </div>
    </div>
  );
}
