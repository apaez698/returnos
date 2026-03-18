import type { RewardProgressStatus } from "@/lib/rewards/types";

interface LoyaltyRewardStatusProps {
  status: RewardProgressStatus;
  redeemableRewardName?: string | null;
  nextRewardName?: string | null;
  remainingPoints: number;
}

export function LoyaltyRewardStatus({
  status,
  redeemableRewardName,
  nextRewardName,
  remainingPoints,
}: LoyaltyRewardStatusProps) {
  if (status === "redeemable") {
    return (
      <section className="h-full rounded-3xl border border-emerald-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-4 shadow-sm shadow-emerald-100 sm:p-4 md:p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800 md:text-sm">
          Estado de recompensa
        </h2>
        <p className="mt-3 text-xl font-bold tracking-tight text-emerald-950 md:text-[1.75rem]">
          Recompensa desbloqueada
        </p>
        <p className="mt-2.5 text-sm text-emerald-900 sm:text-base">
          {redeemableRewardName
            ? `Puedes canjear: ${redeemableRewardName}`
            : "Puedes canjear tu recompensa en tu próxima visita."}
        </p>
        <p className="mt-3 rounded-xl border border-emerald-300/80 bg-white/70 px-3 py-2 text-sm font-medium text-emerald-900">
          Muestra esta tarjeta en caja y pide el canje.
        </p>
      </section>
    );
  }

  if (status === "in_progress") {
    return (
      <section className="h-full rounded-3xl border border-amber-300 bg-gradient-to-b from-amber-50 to-amber-100 p-4 shadow-sm shadow-amber-100 sm:p-4 md:p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800 md:text-sm">
          Estado de recompensa
        </h2>
        <p className="mt-3 text-xl font-bold tracking-tight text-amber-950 md:text-[1.75rem]">
          Sigue adelante
        </p>
        <p className="mt-2.5 text-sm font-medium text-amber-950 sm:text-base">
          {nextRewardName
            ? `${remainingPoints} punto${remainingPoints === 1 ? "" : "s"} para desbloquear ${nextRewardName}.`
            : `${remainingPoints} punto${remainingPoints === 1 ? "" : "s"} para desbloquear tu próxima recompensa.`}
        </p>
        <p className="mt-3 rounded-xl border border-amber-300/80 bg-white/70 px-3 py-2 text-sm text-amber-900">
          Cada compra te acerca más.
        </p>
      </section>
    );
  }

  return (
    <section className="h-full rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 p-4 shadow-sm shadow-slate-200/50 sm:p-4 md:p-6">
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 md:text-sm">
        Estado de recompensa
      </h2>
      <p className="mt-3 text-xl font-bold tracking-tight text-slate-900 md:text-[1.75rem]">
        Sin recompensas disponibles aún
      </p>
      <p className="mt-2.5 text-sm text-slate-700 sm:text-base">
        Las nuevas recompensas aparecerán aquí en cuanto el negocio las agregue.
      </p>
      <p className="mt-3 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-700">
        Sigue acumulando puntos y vuelve pronto.
      </p>
    </section>
  );
}
