import {
  touchInput,
  touchListRow,
  touchSecondary,
} from "@/lib/ui/touch-targets";
import { PosCustomer } from "@/lib/pos/types";

interface CustomerSearchProps {
  query: string;
  customers: PosCustomer[];
  selectedCustomer: PosCustomer | null;
  isLoading: boolean;
  hasSearched: boolean;
  searchMode?: "live" | "submit";
  onQueryChange: (value: string) => void;
  onSubmitSearch?: () => void;
  onSelectCustomer: (customer: PosCustomer) => void;
}

export function CustomerSearch({
  query,
  customers,
  selectedCustomer,
  isLoading,
  hasSearched,
  searchMode = "live",
  onQueryChange,
  onSubmitSearch,
  onSelectCustomer,
}: CustomerSearchProps) {
  const isSubmitMode = searchMode === "submit";

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="customer_search"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Buscar cliente
        </label>
        <div className="flex gap-2">
          <input
            id="customer_search"
            name="customer_search"
            type="search"
            autoComplete="off"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Nombre o teléfono"
            className={touchInput}
          />
          {isSubmitMode ? (
            <button
              type="button"
              onClick={onSubmitSearch}
              className={touchSecondary}
            >
              Buscar
            </button>
          ) : null}
        </div>
      </div>

      {isLoading && customers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Buscando clientes...
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {hasSearched
            ? "No se encontraron clientes con ese criterio."
            : "No hay clientes disponibles para mostrar."}
        </div>
      ) : (
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-xs text-slate-500">Actualizando resultados...</p>
          ) : null}
          <ul className="max-h-[280px] space-y-1.5 overflow-y-auto md:max-h-[360px]">
            {customers.map((customer) => {
              const isSelected = selectedCustomer?.id === customer.id;

              return (
                <li key={customer.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCustomer(customer)}
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
                        <p className="text-xs text-slate-500">
                          {customer.phone}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {customer.points} pts
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
