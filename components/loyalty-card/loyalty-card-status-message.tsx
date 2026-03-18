import type { RewardProgressStatus } from "@/lib/rewards/types";

interface LoyaltyCardStatusMessageProps {
  status: RewardProgressStatus;
  redeemableRewardName?: string | null;
  nextRewardName?: string | null;
  remainingPoints: number;
}

function pluralizePoints(points: number): string {
  return `${points} punto${points === 1 ? "" : "s"}`;
}

export function LoyaltyCardStatusMessage({
  status,
  redeemableRewardName,
  nextRewardName,
  remainingPoints,
}: LoyaltyCardStatusMessageProps) {
  if (status === "redeemable") {
    return (
      <section className="rounded-3xl border border-emerald-300 bg-emerald-50 p-4 shadow-sm shadow-emerald-100 sm:p-5 md:p-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800 md:text-sm">
          Estado de recompensa
        </h3>
        <p className="mt-2 text-sm font-semibold text-emerald-950 sm:text-base">
          {redeemableRewardName
            ? `¡Desbloqueaste ${redeemableRewardName}! Muestra esta tarjeta en caja para canjearlo.`
            : "Tienes una recompensa desbloqueada. Muestra esta tarjeta en caja para canjearla."}
        </p>
      </section>
    );
  }

  if (status === "in_progress") {
    return (
      <section className="rounded-3xl border border-amber-300 bg-amber-50 p-4 shadow-sm shadow-amber-100 sm:p-5 md:p-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800 md:text-sm">
          Estado de recompensa
        </h3>
        <p className="mt-2 text-sm font-semibold text-amber-950 sm:text-base">
          {nextRewardName
            ? `Te faltan ${pluralizePoints(remainingPoints)} para ${nextRewardName}.`
            : `Te faltan ${pluralizePoints(remainingPoints)} para tu próxima recompensa.`}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm shadow-slate-200/50 sm:p-5 md:p-6">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 md:text-sm">
        Estado de recompensa
      </h3>
      <p className="mt-2 text-sm font-semibold text-slate-800 sm:text-base">
        Las recompensas aún no están disponibles. Sigue acumulando puntos y
        vuelve pronto.
      </p>
    </section>
  );
}
