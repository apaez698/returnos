interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
}

export function MetricCard({ label, value, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {trend && <p className="text-green-600 text-sm mt-1">{trend}</p>}
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}
