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
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6"
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

      <section className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-0 shadow-2xl">
        {/* ── Success header ──────────────────────────────────────────── */}
        <div className="rounded-t-2xl bg-emerald-600 px-6 py-5 text-white">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl"
              aria-hidden="true"
            >
              ✓
            </span>
            <div>
              <h2
                id="pcm-title"
                className="text-xl font-bold leading-snug md:text-2xl"
              >
                Compra registrada
              </h2>
              <p className="mt-1 text-sm text-emerald-100">
                El historial del cliente se actualizó correctamente.
              </p>
            </div>
          </div>
        </div>

        {/* ── Receipt details ─────────────────────────────────────────── */}
        <div className="px-6 pt-5">
          <dl className="grid grid-cols-2 gap-3">
            {/* Customer – spans full row */}
            <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Cliente
              </dt>
              <dd className="mt-1 truncate text-base font-semibold text-slate-900 md:text-lg">
                {receipt.customerName}
              </dd>
            </div>

            {/* Amount */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Monto
              </dt>
              <dd className="mt-1 text-base font-semibold text-slate-900 md:text-lg">
                {formatCurrency(receipt.amount)}
              </dd>
            </div>

            {/* Points earned */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                Puntos ganados
              </dt>
              <dd className="mt-1 text-2xl font-bold leading-none text-indigo-900 md:text-3xl">
                +{receipt.pointsEarned}
              </dd>
            </div>

            {/* Updated total – spans full row */}
            <div className="col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Puntos totales del cliente
              </dt>
              <dd className="mt-1 text-2xl font-bold leading-none text-emerald-900 md:text-3xl">
                {receipt.updatedPoints}
              </dd>
            </div>
          </dl>
        </div>

        {/* ── Reward progress ─────────────────────────────────────────── */}
        <div className="px-6 pt-4">
          <PurchaseRewardProgress
            updatedPoints={receipt.updatedPoints}
            rewardThresholds={rewardThresholds}
            unlockedRewardName={receipt.unlockedRewardName}
          />
        </div>

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <div className="mt-5 flex flex-col gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50 px-6 py-5">
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
