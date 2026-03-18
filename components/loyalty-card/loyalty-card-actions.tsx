"use client";

import { useMemo, useState } from "react";
import type { WalletPlatformAvailability } from "@/features/wallet/shared/get-wallet-platform-availability";
import { useAddToWallet } from "./use-add-to-wallet";

interface LoyaltyCardActionsProps {
  cardToken: string;
  availablePlatforms: WalletPlatformAvailability;
  businessName: string;
}

export function LoyaltyCardActions({
  cardToken,
  availablePlatforms,
  businessName,
}: LoyaltyCardActionsProps) {
  const { loadingPlatform, error, addAppleWallet, addGoogleWallet } =
    useAddToWallet({
      cardToken,
    });
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [shareStatus, setShareStatus] = useState<"idle" | "shared" | "error">(
    "idle",
  );

  const isLoading = loadingPlatform !== null;
  const canUseShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.location.href;
  }, []);

  const shareTitle = `Tarjeta de fidelidad de ${businessName}`;

  async function handleCopyLink() {
    if (!shareUrl || !navigator.clipboard) {
      setCopyStatus("error");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1800);
    } catch {
      setCopyStatus("error");
    }
  }

  async function handleShareCard() {
    if (!shareUrl || !navigator.share) {
      setShareStatus("error");
      return;
    }

    try {
      await navigator.share({
        title: shareTitle,
        text: "Escanea esta tarjeta para acumular puntos de fidelidad.",
        url: shareUrl,
      });
      setShareStatus("shared");
      window.setTimeout(() => setShareStatus("idle"), 1800);
    } catch {
      setShareStatus("error");
    }
  }

  return (
    <section className="h-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 sm:p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 md:text-sm">
            Acciones de tarjeta
          </h2>
          <p className="mt-1 text-sm text-slate-600 md:text-base">
            Guarda, comparte y mantén tu tarjeta de fidelidad a un toque.
          </p>
        </div>
        {isLoading ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 md:text-sm">
            Preparando...
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 active:scale-[0.99]"
        >
          {copyStatus === "copied"
            ? "Enlace copiado"
            : "Copiar enlace de tarjeta"}
        </button>

        <button
          type="button"
          onClick={handleShareCard}
          disabled={!canUseShare}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {shareStatus === "shared"
            ? "Compartido"
            : canUseShare
              ? "Compartir tarjeta"
              : "Compartir no disponible"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3">
        {availablePlatforms.apple ? (
          <button
            type="button"
            onClick={addAppleWallet}
            disabled={isLoading}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>

      <div className="mt-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
        Recordatorios por WhatsApp próximamente
      </div>

      {copyStatus === "error" ? (
        <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 md:text-base">
          No se pudo copiar el enlace. Inténtalo de nuevo.
        </p>
      ) : null}

      {shareStatus === "error" ? (
        <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 md:text-base">
          Compartir no está disponible en este dispositivo ahora.
        </p>
      ) : null}

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
