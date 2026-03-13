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

  const hasAnyWalletPlatform =
    availablePlatforms.apple || availablePlatforms.google;

  if (!hasAnyWalletPlatform) {
    return null;
  }

  const isLoading = loadingPlatform !== null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Add to wallet
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Save this loyalty card to your phone for faster check-ins.
          </p>
        </div>
        {isLoading ? (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            Preparing...
          </span>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {availablePlatforms.apple ? (
          <button
            type="button"
            onClick={addAppleWallet}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={
              loadingPlatform === "apple"
                ? "Preparing Apple Wallet pass"
                : "Add to Apple Wallet"
            }
          >
            {loadingPlatform === "apple"
              ? "Preparing Apple Wallet..."
              : "Add to Apple Wallet"}
          </button>
        ) : null}

        {availablePlatforms.google ? (
          <button
            type="button"
            onClick={addGoogleWallet}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={
              loadingPlatform === "google"
                ? "Preparing Google Wallet link"
                : "Add to Google Wallet"
            }
          >
            {loadingPlatform === "google"
              ? "Preparing Google Wallet..."
              : "Add to Google Wallet"}
          </button>
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          aria-live="polite"
          className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
