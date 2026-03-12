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
          className="mb-1 block text-sm font-medium text-slate-700"
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
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-indigo-500 focus:ring-2"
          />
          {isSubmitMode ? (
            <button
              type="button"
              onClick={onSubmitSearch}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Buscar
            </button>
          ) : null}
        </div>
      </div>

      {isLoading && customers.length === 0 ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          Buscando clientes...
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          {hasSearched
            ? "No se encontraron clientes con ese criterio."
            : "No hay clientes disponibles para mostrar."}
        </div>
      ) : (
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-xs text-slate-500">Actualizando resultados...</p>
          ) : null}
          <ul className="max-h-56 space-y-2 overflow-y-auto">
            {customers.map((customer) => {
              const isSelected = selectedCustomer?.id === customer.id;

              return (
                <li key={customer.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCustomer(customer)}
                    className={`w-full rounded-md border px-3 py-2 text-left transition ${
                      isSelected
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">
                        {customer.name}
                      </p>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {customer.points} pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{customer.phone}</p>
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
