"use client";

import type { WalletPlatformAvailability } from "@/features/wallet/shared/get-wallet-platform-availability";
import { useAddToWallet } from "./use-add-to-wallet";

interface AddToWalletButtonsProps {
  cardToken: string;
  availablePlatforms: WalletPlatformAvailability;
}

export function AddToWalletButtons({
  cardToken,
  availablePlatforms,
}: AddToWalletButtonsProps) {
  const { loadingPlatform, error, addAppleWallet, addGoogleWallet } =
    useAddToWallet({
      cardToken,
    });

  const isLoading = loadingPlatform !== null;
  const hasAnyWalletPlatform =
    availablePlatforms.apple || availablePlatforms.google;

  if (!hasAnyWalletPlatform) {
    return null;
  }

  return (
    <section className="h-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 sm:p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 md:text-sm">
            Acciones rápidas
          </h2>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Guarda tu tarjeta y mantén tus recompensas al alcance.
          </p>
        </div>
        {isLoading ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 md:text-sm">
            Preparando...
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:mt-5">
        {availablePlatforms.apple ? (
          <button
            type="button"
            onClick={addAppleWallet}
            disabled={isLoading}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={
              loadingPlatform === "apple"
                ? "Preparando pase de Apple Wallet"
                : "Agregar a Apple Wallet"
            }
          >
            {loadingPlatform === "apple"
              ? "Preparando Apple Wallet..."
              : "Agregar a Apple Wallet"}
          </button>
        ) : (
          <div className="inline-flex min-h-12 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
            Apple Wallet próximamente
          </div>
        )}

        {availablePlatforms.google ? (
          <button
            type="button"
            onClick={addGoogleWallet}
            disabled={isLoading}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={
              loadingPlatform === "google"
                ? "Preparando enlace de Google Wallet"
                : "Agregar a Google Wallet"
            }
          >
            {loadingPlatform === "google"
              ? "Preparando Google Wallet..."
              : "Agregar a Google Wallet"}
          </button>
        ) : (
          <div className="inline-flex min-h-12 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
            Google Wallet próximamente
          </div>
        )}

        <div className="inline-flex min-h-12 items-center justify-center rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Recordatorios por WhatsApp próximamente
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          aria-live="polite"
          className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 md:text-base"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
