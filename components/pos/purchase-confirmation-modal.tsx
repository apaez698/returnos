"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PosPurchaseReceipt, PosRewardThreshold } from "@/lib/pos/types";
import { touchModalPrimary, touchModalSecondary } from "@/lib/ui/touch-targets";
import { PurchaseRewardProgress } from "./purchase-reward-progress";

interface PurchaseConfirmationModalProps {
  receipt: PosPurchaseReceipt;
  rewardThresholds: PosRewardThreshold[];
  onClose: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function PurchaseConfirmationModal({
  receipt,
  rewardThresholds,
  onClose,
}: PurchaseConfirmationModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMounted, onClose]);

  const loyaltyCardPath = receipt.cardToken
    ? `/card/${encodeURIComponent(receipt.cardToken)}`
    : null;

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-4 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:px-14 lg:py-14"
      role="dialog"
      aria-labelledby="pcm-title"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0 cursor-default bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <section className="relative w-full max-w-xl overflow-y-auto rounded-[2rem] border border-slate-200/80 bg-white/95 p-0 shadow-[0_36px_90px_-28px_rgba(15,23,42,0.45),0_18px_32px_-24px_rgba(15,23,42,0.35)] backdrop-blur max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] md:max-h-[calc(100dvh-5rem)]">
        {/* ── Success header ──────────────────────────────────────────── */}
        <div className="rounded-t-[1.9rem] bg-emerald-600 px-5 py-4 text-white md:px-8 md:py-7">
          <div className="flex items-start gap-2 md:gap-3">
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-base md:h-10 md:w-10 md:text-xl"
              aria-hidden="true"
            >
              ✓
            </span>
            <div>
              <h2
                id="pcm-title"
                className="text-base font-bold leading-snug md:text-xl lg:text-2xl"
              >
                Compra registrada
              </h2>
              <p className="dashboard-explainer mt-1.5 text-xs text-emerald-100 md:text-sm">
                El historial del cliente se actualizó correctamente.
              </p>
            </div>
          </div>
        </div>

        {/* ── Receipt details ─────────────────────────────────────────── */}
        <div className="px-5 pt-5 md:px-8 md:pt-7">
          <dl className="grid grid-cols-2 gap-2.5 md:gap-4">
            {/* Customer – spans full row */}
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:px-5 md:py-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Cliente
              </dt>
              <dd className="mt-0.5 truncate text-sm font-semibold text-slate-900 md:text-base lg:text-lg">
                {receipt.customerName}
              </dd>
            </div>

            {/* Amount */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 md:px-5 md:py-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Monto
              </dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-900 md:text-base lg:text-lg">
                {formatCurrency(receipt.amount)}
              </dd>
            </div>

            {/* Points earned */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 md:px-5 md:py-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                Puntos ganados
              </dt>
              <dd className="mt-0.5 text-xl font-bold leading-none text-indigo-900 md:text-2xl lg:text-3xl">
                +{receipt.pointsEarned}
              </dd>
            </div>

            {/* Updated total – spans full row */}
            <div className="col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 md:px-5 md:py-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Puntos totales del cliente
              </dt>
              <dd className="mt-0.5 text-xl font-bold leading-none text-emerald-900 md:text-2xl lg:text-3xl">
                {receipt.updatedPoints}
              </dd>
            </div>
          </dl>
        </div>

        {/* ── Reward progress ─────────────────────────────────────────── */}
        <div className="px-5 pt-5 md:px-8 md:pt-6">
          <PurchaseRewardProgress
            updatedPoints={receipt.updatedPoints}
            rewardThresholds={rewardThresholds}
            unlockedRewardName={receipt.unlockedRewardName}
          />
        </div>

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <div className="mt-5 grid grid-cols-1 gap-2.5 rounded-b-[1.9rem] border-t border-slate-100 bg-slate-50 px-5 py-5 md:mt-7 md:grid-cols-2 md:gap-3 md:px-8 md:py-7 lg:grid-cols-1">
          <button type="button" onClick={onClose} className={touchModalPrimary}>
            Registrar otra compra
          </button>

          {loyaltyCardPath ? (
            <Link href={loyaltyCardPath} className={touchModalSecondary}>
              Ver tarjeta de lealtad
            </Link>
          ) : null}
        </div>
      </section>
    </div>,
    document.body,
  );
}
