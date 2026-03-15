interface LoyaltyCardQrSectionProps {
  qrCodeDataUrl?: string | null;
  customerIdentifier: string;
}

export function LoyaltyCardQrSection({
  qrCodeDataUrl,
  customerIdentifier,
}: LoyaltyCardQrSectionProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 sm:p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 md:text-sm">
            Scan at checkout
          </h2>
          <p className="mt-1 text-sm text-slate-600 md:text-base">
            Present this code to register your visit and points.
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
          Ready to scan
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[auto,1fr] sm:items-center md:gap-5">
        {qrCodeDataUrl ? (
          <img
            src={qrCodeDataUrl}
            alt="Customer QR code"
            className="h-40 w-40 rounded-2xl border-2 border-slate-200 bg-white object-cover p-1.5 sm:h-44 sm:w-44 md:h-48 md:w-48"
          />
        ) : (
          <div
            className="flex h-40 w-40 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:h-44 sm:w-44 md:h-48 md:w-48"
            aria-hidden
          >
            ID only
          </div>
        )}

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 md:text-sm">
            Customer identifier
          </p>
          <p className="mt-2 break-all rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 font-mono text-sm font-semibold text-slate-900 md:text-base">
            {customerIdentifier}
          </p>

          <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 md:text-base">
            Keep this screen visible while the cashier scans your QR.
          </div>
        </div>
      </div>
    </section>
  );
}
