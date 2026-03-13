export function RedemptionsEmptyState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
      <svg
        className="mx-auto h-12 w-12 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        Sin canjes aún
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        No hay canjes de recompensas registrados. Los canjes aparecerán aquí
        cuando tus clientes comiencen a usar sus puntos.
      </p>
    </div>
  );
}
