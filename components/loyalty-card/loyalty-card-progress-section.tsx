interface LoyaltyCardProgressSectionProps {
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

export function LoyaltyCardProgressSection({
  currentPoints,
  targetPoints,
  progressPercentage,
  remainingPoints,
}: LoyaltyCardProgressSectionProps) {
  const normalizedProgress = clampPercentage(progressPercentage);
  const hasTarget = typeof targetPoints === "number" && targetPoints > 0;

  if (!hasTarget) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 sm:p-5 md:p-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 md:text-sm">
          Progress to next reward
        </h3>
        <p className="mt-2 text-sm text-slate-700 sm:text-base">
          This business has no active rewards yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 sm:p-5 md:p-6">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 md:text-sm mb-4">
        Progress to next reward
      </h3>

      {/* Progress label above bar */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-sm font-bold text-slate-900 truncate">
          {remainingPoints > 0
            ? `${remainingPoints} point${remainingPoints === 1 ? "" : "s"} left`
            : "Reward threshold reached"}
        </p>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 whitespace-nowrap">
          {normalizedProgress}%
        </span>
      </div>

      {/* Progress bar with rounded corners and proper height */}
      <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 shadow-sm md:h-5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all duration-500"
          style={{ width: `${normalizedProgress}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={normalizedProgress}
          aria-label="Progress toward next reward"
        />
      </div>

      {/* Points summary below bar with proper spacing */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 sm:px-4 sm:py-2.5 sm:text-sm">
          {currentPoints} / {targetPoints} points
        </p>
        <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 sm:px-4 sm:py-2.5 sm:text-sm">
          Current: {currentPoints}
        </p>
      </div>
    </section>
  );
}
