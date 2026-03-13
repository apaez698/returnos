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
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Current points
        </h2>
        <p className="text-2xl font-bold text-slate-900">{currentPoints}</p>
      </div>

      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{ width: `${normalizedProgress}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={normalizedProgress}
          aria-label="Reward progress"
        />
      </div>

      {hasTarget ? (
        <div className="mt-3 space-y-1 text-sm text-slate-600">
          <p>
            {currentPoints} / {targetPoints} points to your next reward
          </p>
          <p>
            {remainingPoints > 0
              ? `${remainingPoints} points left`
              : "You have reached the next reward level."}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-600">
          This business has no active rewards yet.
        </p>
      )}
    </section>
  );
}
