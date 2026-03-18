interface LoyaltyCardPointsHeroProps {
  currentPoints: number;
}

export function LoyaltyCardPointsHero({
  currentPoints,
}: LoyaltyCardPointsHeroProps) {
  return (
    <section className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-100 via-amber-100 to-white p-4 shadow-sm shadow-orange-200/60 sm:p-5 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700 md:text-sm">
        Puntos actuales
      </p>
      <div className="mt-3 flex items-end gap-2 sm:gap-3">
        <p className="text-5xl font-black leading-none tracking-tight text-orange-950 sm:text-6xl md:text-7xl">
          {currentPoints}
        </p>
        <p className="pb-1 text-base font-semibold text-orange-800 sm:pb-2 md:text-lg">
          puntos
        </p>
      </div>
      <p className="mt-3 text-sm text-orange-900 sm:text-base">
        Tu saldo de fidelidad se actualiza después de cada compra.
      </p>
    </section>
  );
}
