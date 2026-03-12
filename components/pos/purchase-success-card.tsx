import { PosPurchaseReceipt } from "@/lib/pos/types";

interface PurchaseSuccessCardProps {
  receipt: PosPurchaseReceipt;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function PurchaseSuccessCard({ receipt }: PurchaseSuccessCardProps) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-semibold text-emerald-800">
        Compra registrada correctamente
      </p>

      <dl className="mt-3 space-y-2 text-sm text-emerald-900">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-emerald-800">Cliente</dt>
          <dd className="font-medium text-right">{receipt.customerName}</dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <dt className="text-emerald-800">Monto</dt>
          <dd className="font-medium text-right">
            {formatCurrency(receipt.amount)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <dt className="text-emerald-800">Puntos ganados</dt>
          <dd className="font-medium text-right">+{receipt.pointsEarned}</dd>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-emerald-200 pt-2">
          <dt className="font-medium text-emerald-900">Puntos actuales</dt>
          <dd className="font-semibold text-emerald-900">
            {receipt.updatedPoints}
          </dd>
        </div>
      </dl>

      {receipt.unlockedRewardName ? (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
          Recompensa disponible: {receipt.unlockedRewardName}
        </p>
      ) : null}
    </div>
  );
}
