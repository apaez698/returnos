import { RecentVisitItem } from "@/lib/visits/types";

interface RecentVisitsTableProps {
  visits: RecentVisitItem[];
}

function formatDate(dateInput: string): string {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatAmount(amount: number | null): string {
  if (amount === null) {
    return "-";
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount);
}

const sourceLabels: Record<RecentVisitItem["source"], string> = {
  manual: "Manual",
  in_store: "En tienda",
  qr: "QR",
};

export function RecentVisitsTable({ visits }: RecentVisitsTableProps) {
  if (visits.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Todavia no hay visitas registradas.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-700">
          <tr>
            <th className="px-4 py-3 font-semibold">Fecha</th>
            <th className="px-4 py-3 font-semibold">Cliente</th>
            <th className="px-4 py-3 font-semibold">Puntos</th>
            <th className="px-4 py-3 font-semibold">Monto</th>
            <th className="px-4 py-3 font-semibold">Categoria</th>
            <th className="px-4 py-3 font-semibold">Origen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {visits.map((visit) => (
            <tr key={visit.id}>
              <td className="px-4 py-3">{formatDate(visit.created_at)}</td>
              <td className="px-4 py-3">{visit.customer_name}</td>
              <td className="px-4 py-3">+{visit.points_earned}</td>
              <td className="px-4 py-3">{formatAmount(visit.amount)}</td>
              <td className="px-4 py-3">{visit.product_category || "-"}</td>
              <td className="px-4 py-3">{sourceLabels[visit.source]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
