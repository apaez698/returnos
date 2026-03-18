interface LoyaltyProgressBarProps {
  currentPoints: number;
  targetPoints: number | null;
  progressPercentage: number;
  remainingPoints: number;
}

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

export function LoyaltyProgressBar({
  currentPoints,
  targetPoints,
  progressPercentage,
  remainingPoints,
}: LoyaltyProgressBarProps) {
  const normalizedProgress = clampPercentage(progressPercentage);
  const hasTarget = typeof targetPoints === "number" && targetPoints > 0;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 sm:p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 md:text-sm">
            Puntos actuales
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Tu saldo de fidelidad en tiempo real
          </p>
        </div>
        {hasTarget ? (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
            {normalizedProgress}% hacia la recompensa
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-end gap-2 sm:gap-3">
        <p className="text-4xl font-bold leading-none tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
          {currentPoints}
        </p>
        <p className="pb-1.5 text-base font-semibold text-slate-600 sm:pb-2 md:text-lg">
          puntos
        </p>
      </div>

      <div className="mt-5 h-4 w-full overflow-hidden rounded-full bg-slate-200 md:h-5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all"
          style={{ width: `${normalizedProgress}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={normalizedProgress}
          aria-label="Progreso de recompensa"
        />
      </div>

      {hasTarget ? (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 md:p-4">
          <p className="text-sm font-semibold text-slate-900 sm:text-base">
            {remainingPoints > 0
              ? `${remainingPoints} punto${remainingPoints === 1 ? "" : "s"} para tu próxima recompensa`
              : "Nivel de recompensa alcanzado. Puedes canjearlo en tu próxima visita."}
          </p>
          <p className="mt-1.5 text-sm text-slate-600 sm:text-base">
            {currentPoints} / {targetPoints} puntos
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-600 md:text-base">
          Este negocio aún no tiene recompensas activas.
        </p>
      )}
    </section>
  );
}
