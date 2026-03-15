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
    <header className="rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50/70 to-white p-4 shadow-sm shadow-amber-900/10 sm:p-5 md:p-6">
      <div className="flex items-center gap-3.5 sm:gap-4 md:gap-5">
        <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white text-xl font-bold text-amber-900 ring-2 ring-amber-200 sm:h-20 sm:w-20 md:h-24 md:w-24 md:text-2xl">
          {businessLogoUrl ? (
            <img
              src={businessLogoUrl}
              alt={`${businessName} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span aria-hidden className="tracking-wide">
              {initials}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-amber-700 sm:text-xs">
            ReturnOS loyalty card
          </p>
          <p className="mt-1 truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-[2.1rem]">
            {businessName}
          </p>
          <p className="mt-1.5 text-sm font-medium text-slate-700 sm:text-base md:text-lg">
            Earn points every visit and unlock rewards faster.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl border border-white/80 bg-white/85 p-3.5 backdrop-blur-sm sm:grid-cols-[1fr,auto] sm:items-end sm:gap-3 md:mt-5 md:p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Cardholder
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900 sm:text-lg md:text-xl">
            {customerName}
          </p>
          <p className="mt-1 text-sm text-slate-600">{maskedPhone}</p>
        </div>
        <div className="inline-flex w-fit items-center rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-900">
          Customer
        </div>
      </div>
    </header>
  );
}
