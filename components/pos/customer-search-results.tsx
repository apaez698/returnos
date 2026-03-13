import { touchListRow } from "@/lib/ui/touch-targets";
import { PosCustomer } from "@/lib/pos/types";

interface CustomerSearchResultsProps {
  customers: PosCustomer[];
  selectedCustomerId: string;
  isLoading: boolean;
  hasSearched: boolean;
  onSelect: (customer: PosCustomer) => void;
}

export function CustomerSearchResults({
  customers,
  selectedCustomerId,
  isLoading,
  hasSearched,
  onSelect,
}: CustomerSearchResultsProps) {
  if (isLoading && customers.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Buscando clientes...
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {hasSearched
          ? "No se encontraron clientes con ese criterio."
          : "No hay clientes disponibles para mostrar."}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isLoading ? (
        <p className="text-xs text-slate-500">Actualizando resultados...</p>
      ) : null}
      <ul className="max-h-[280px] space-y-1.5 overflow-y-auto md:max-h-[360px]">
        {customers.map((customer) => {
          const isSelected = selectedCustomerId === customer.id;

          return (
            <li key={customer.id}>
              <button
                type="button"
                onClick={() => onSelect(customer)}
                className={`${touchListRow} ${
                  isSelected
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {customer.name}
                    </p>
                    <p className="text-xs text-slate-500">{customer.phone}</p>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
