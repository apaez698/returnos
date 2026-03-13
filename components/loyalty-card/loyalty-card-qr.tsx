interface LoyaltyCardQrProps {
  qrCodeDataUrl?: string | null;
  customerIdentifier: string;
}

export function LoyaltyCardQr({
  qrCodeDataUrl,
  customerIdentifier,
}: LoyaltyCardQrProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 sm:p-5 md:p-6">
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 md:text-sm">
        Check-in code
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-[auto,1fr] sm:items-center md:gap-5">
        {qrCodeDataUrl ? (
          <img
            src={qrCodeDataUrl}
            alt="Customer QR code"
            className="h-32 w-32 rounded-xl border-2 border-slate-200 bg-white object-cover p-1 sm:h-36 sm:w-36 md:h-44 md:w-44"
          />
        ) : (
          <div
            className="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:h-36 sm:w-36 md:h-44 md:w-44"
            aria-hidden
          >
            ID
          </div>
        )}

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500 md:text-sm">
            Customer identifier
          </p>
          <p className="mt-2 break-all rounded-lg bg-slate-50 px-2.5 py-2 font-mono text-sm text-slate-900 md:text-base">
            {customerIdentifier}
          </p>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Show this code at checkout to get points.
          </p>
        </div>
      </div>
    </section>
  );
}
