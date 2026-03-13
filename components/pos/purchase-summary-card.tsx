import Link from "next/link";
import { PosPurchaseReceipt, PosRewardThreshold } from "@/lib/pos/types";
import { touchPrimary, touchSecondary } from "@/lib/ui/touch-targets";
import { PurchaseRewardProgress } from "./purchase-reward-progress";

interface PurchaseSummaryCardProps {
  receipt: PosPurchaseReceipt;
  rewardThresholds: PosRewardThreshold[];
  onRegisterAnotherPurchase?: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function PurchaseSummaryCard({
  receipt,
  rewardThresholds,
  onRegisterAnotherPurchase,
}: PurchaseSummaryCardProps) {
  const loyaltyCardPath = receipt.cardToken
    ? `/card/${encodeURIComponent(receipt.cardToken)}`
    : null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-emerald-800">
          Compra registrada correctamente
        </h3>
        <p className="mt-0.5 text-xs text-emerald-700">
          El resumen ya se agrego al historial del cliente.
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Cliente
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">
            {receipt.customerName}
          </dd>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Monto
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">
            {formatCurrency(receipt.amount)}
          </dd>
        </div>

        <div className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-indigo-600">
            Puntos ganados
          </dt>
          <dd className="mt-1 text-lg font-bold leading-none text-indigo-900">
            +{receipt.pointsEarned}
          </dd>
        </div>

        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            Puntos actuales
          </dt>
          <dd className="mt-1 text-lg font-bold leading-none text-emerald-900">
            {receipt.updatedPoints}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <PurchaseRewardProgress
          updatedPoints={receipt.updatedPoints}
          rewardThresholds={rewardThresholds}
          unlockedRewardName={receipt.unlockedRewardName}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {loyaltyCardPath ? (
          <Link href={loyaltyCardPath} className={touchSecondary}>
            Ver tarjeta de lealtad
          </Link>
        ) : (
          <span
            className="flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500"
            aria-disabled="true"
          >
            Tarjeta no disponible
          </span>
        )}

        <button
          type="button"
          onClick={onRegisterAnotherPurchase}
          className={touchPrimary}
        >
          Registrar otra compra
        </button>
      </div>
    </section>
  );
}
