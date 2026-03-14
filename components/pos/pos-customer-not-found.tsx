import { touchPrimary } from "@/lib/ui/touch-targets";

interface PosCustomerNotFoundProps {
  query: string;
  onCreateCustomer?: () => void;
}

export function PosCustomerNotFound({
  query,
  onCreateCustomer,
}: PosCustomerNotFoundProps) {
  const trimmedQuery = query.trim();

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 md:px-5 md:py-5">
      <p className="text-sm font-semibold text-amber-900 md:text-base">
        No encontramos un cliente para esta busqueda.
      </p>
      <p className="mt-1 text-sm text-amber-800">
        {trimmedQuery
          ? `Sin coincidencias para "${trimmedQuery}". Puedes crear el cliente en segundos.`
          : "Intenta con otro nombre o telefono, o crea un cliente nuevo."}
      </p>

      {onCreateCustomer ? (
        <button
          type="button"
          onClick={onCreateCustomer}
          className={`${touchPrimary} mt-3`}
        >
          Crear cliente nuevo
        </button>
      ) : null}
    </div>
  );
}
