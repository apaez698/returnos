interface RewardsEmptyStateProps {
  title?: string;
  description?: string;
}

export function RewardsEmptyState({
  title = "No encontramos clientes",
  description = "Prueba otro nombre, telefono o filtro para ver resultados.",
}: RewardsEmptyStateProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}
