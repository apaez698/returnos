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
    <section className="rounded-3xl border border-slate-200 bg-white p-3.5 shadow-sm shadow-slate-200/60 sm:p-4 md:p-5">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 md:text-sm">
          Current points
        </h2>
        {hasTarget ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {normalizedProgress}% complete
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-end gap-2">
        <p className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-5xl">
          {currentPoints}
        </p>
        <p className="pb-1 text-sm font-medium text-slate-600 md:pb-1.5">
          points
        </p>
      </div>

      <div className="mt-4 h-3.5 w-full overflow-hidden rounded-full bg-slate-200 md:h-4">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 transition-all"
          style={{ width: `${normalizedProgress}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={normalizedProgress}
          aria-label="Reward progress"
        />
      </div>

      {hasTarget ? (
        <div className="mt-3.5 rounded-2xl border border-slate-100 bg-slate-50 p-3 md:mt-4 md:p-3.5">
          <p className="text-sm font-semibold text-slate-900">
            {remainingPoints > 0
              ? `${remainingPoints} points left for your next reward`
              : "You have reached the next reward level."}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {currentPoints} / {targetPoints} points
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-600 md:mt-4">
          This business has no active rewards yet.
        </p>
      )}
    </section>
  );
}
