interface LoyaltyCardHeaderProps {
  businessName: string;
  businessLogoUrl?: string | null;
  customerName: string;
  maskedPhone: string;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (words.length === 0) {
    return "RO";
  }

  return words.map((word) => word.charAt(0).toUpperCase()).join("");
}

export function LoyaltyCardHeader({
  businessName,
  businessLogoUrl,
  customerName,
  maskedPhone,
}: LoyaltyCardHeaderProps) {
  const initials = getInitials(businessName);

  return (
    <header className="rounded-3xl border border-slate-200 bg-white p-3.5 shadow-sm shadow-slate-200/60 sm:p-4 md:p-5">
      <div className="flex items-center gap-3 sm:gap-3.5 md:gap-4">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-base font-semibold text-slate-700 ring-1 ring-slate-200 sm:h-14 sm:w-14 md:h-16 md:w-16 md:text-lg">
          {businessLogoUrl ? (
            <img
              src={businessLogoUrl}
              alt={`${businessName} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span aria-hidden>{initials}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold tracking-tight text-slate-900 sm:text-xl md:text-[1.65rem]">
            {businessName}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Loyalty card
          </p>
        </div>
      </div>

      <div className="mt-3.5 border-t border-slate-100 pt-3.5 md:mt-4 md:pt-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Customer
        </p>
        <p className="mt-1 text-base font-semibold text-slate-900">
          {customerName}
        </p>
        <p className="mt-1 text-sm text-slate-600">{maskedPhone}</p>
      </div>
    </header>
  );
}
