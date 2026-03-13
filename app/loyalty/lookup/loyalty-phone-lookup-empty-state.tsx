interface LoyaltyPhoneLookupEmptyStateProps {
  message?: string | null;
}

export function LoyaltyPhoneLookupEmptyState({
  message,
}: LoyaltyPhoneLookupEmptyStateProps) {
  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950 md:px-5 md:py-5"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-semibold md:text-base">
        No encontramos tu tarjeta.
      </p>
      <p className="mt-1 text-sm leading-relaxed text-amber-900 md:text-base">
        {message ??
          "Revisa tu numero, confirma que tenga 10 digitos e intenta de nuevo."}
      </p>
    </div>
  );
}
