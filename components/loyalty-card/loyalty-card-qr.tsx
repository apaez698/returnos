interface LoyaltyCardQrProps {
  qrCodeDataUrl?: string | null;
  customerIdentifier: string;
}

export function LoyaltyCardQr({
  qrCodeDataUrl,
  customerIdentifier,
}: LoyaltyCardQrProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Check-in code
      </h2>

      <div className="mt-3 flex items-center gap-4">
        {qrCodeDataUrl ? (
          <img
            src={qrCodeDataUrl}
            alt="Customer QR code"
            className="h-24 w-24 rounded-lg border border-slate-200 bg-white object-cover"
          />
        ) : (
          <div
            className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"
            aria-hidden
          >
            ID
          </div>
        )}

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Customer identifier
          </p>
          <p className="mt-1 break-all font-mono text-sm text-slate-900">
            {customerIdentifier}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Show this code at checkout to get points.
          </p>
        </div>
      </div>
    </section>
  );
}
