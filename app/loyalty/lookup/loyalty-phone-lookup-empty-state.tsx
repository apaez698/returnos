interface LoyaltyPhoneLookupEmptyStateProps {
  message?: string | null;
}

export function LoyaltyPhoneLookupEmptyState({
  message,
}: LoyaltyPhoneLookupEmptyStateProps) {
  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-medium">
        {message ??
          "No encontramos una tarjeta con ese numero. Revisa el telefono e intenta otra vez."}
      </p>
    </div>
  );
}
