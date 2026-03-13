import { RedemptionItem } from "@/lib/rewards/redemptions-types";
import {
  formatRedemptionDate,
  formatRedemptionValue,
} from "@/lib/rewards/redemptions-formatters";

interface RedemptionsTableProps {
  redemptions: RedemptionItem[];
}

export function RedemptionsTable({ redemptions }: RedemptionsTableProps) {
  return (
    <>
      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {redemptions.map((redemption) => (
          <article
            key={redemption.id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {redemption.customer_name}
                </h3>
                {redemption.customer_phone && (
                  <p className="mt-1 text-xs text-slate-500">
                    {redemption.customer_phone}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-indigo-600">
                  {formatRedemptionValue(redemption.points_spent)}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 font-medium">
              {redemption.reward_name}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {formatRedemptionDate(redemption.redeemed_at)}
            </p>
          </article>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">
                Cliente
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">
                Recompensa
              </th>
              <th className="px-6 py-3 text-right font-semibold text-slate-900">
                Puntos
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {redemptions.map((redemption) => (
              <tr key={redemption.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {redemption.customer_name}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {redemption.customer_phone ?? "-"}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="max-w-xs">
                    <p className="font-medium">{redemption.reward_name}</p>
                    {redemption.reward_description && (
                      <p className="mt-1 text-xs text-slate-500">
                        {redemption.reward_description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-indigo-600">
                  {formatRedemptionValue(redemption.points_spent)}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {formatRedemptionDate(redemption.redeemed_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
