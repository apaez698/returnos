"use client";

import { useEffect, useState } from "react";

const QR_CELL_COUNT = 16;
const QR_REFRESH_INTERVAL_MS = 900;

function createQrCells() {
  return Array.from({ length: QR_CELL_COUNT }, () => Math.random() > 0.4);
}

export function LoyaltyCardMockup() {
  const [qrCells, setQrCells] = useState<boolean[]>(() => createQrCells());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setQrCells(createQrCells());
    }, QR_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const flowSteps = [
    { icon: "1", label: "Cliente compra" },
    { icon: "2", label: "Gana puntos automáticamente" },
    { icon: "3", label: "Regresa por su recompensa" },
  ];

  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Card Container */}
      <div className="relative min-h-[22rem] rounded-2xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 p-6 shadow-2xl">
        {/* Top Section */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-orange-100 uppercase">
              Tarjeta de Fidelización
            </p>
            <p className="mt-2 text-lg font-bold text-white">Mi Panadería</p>
          </div>
          <div className="text-2xl font-bold text-orange-100">★</div>
        </div>

        {/* Points Display */}
        <div className="mb-3 rounded-xl bg-white/20 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium text-orange-100">
            Puntos acumulados
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">2,450</span>
            <span className="text-sm text-orange-100">pts</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 space-y-2 rounded-lg bg-black/10 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-100/90">
            Falta para próxima recompensa
          </p>
          <p className="text-base font-extrabold leading-snug text-white">
            Te faltan 1,550 pts para tu café gratis ☕
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full w-2/3 rounded-full bg-white transition-all" />
          </div>
        </div>
      </div>

      {/* Mini customer flow */}
      <div className="mt-6 rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-4 py-3">
        <div className="grid grid-cols-3 gap-2">
          {flowSteps.map((step, index) => (
            <div
              key={step.label}
              className={`flex min-w-0 flex-col items-center gap-1.5 px-1 text-center ${
                index < flowSteps.length - 1 ? "border-r border-zinc-200" : ""
              }`}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-[10px] font-semibold text-zinc-600">
                {step.icon}
              </div>
              <p className="text-[10px] leading-snug text-zinc-600">
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Mockup */}
      <div className="mt-8 flex justify-center">
        <div className="relative h-32 w-32 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 p-2 shadow-lg">
          <div className="grid h-full grid-cols-4 gap-0.5 bg-white">
            {qrCells.map((isDarkCell, i) => (
              <div
                key={i}
                className={`rounded-sm transition-colors duration-500 ${
                  isDarkCell ? "bg-zinc-900" : "bg-white"
                }`}
              />
            ))}
          </div>
          <div className="absolute inset-0 rounded-lg border border-zinc-300" />
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-4 rounded-full bg-green-50 px-4 py-2 text-center">
        <p className="text-xs font-semibold text-green-700">
          ✓ Tarjeta activa y verificada
        </p>
      </div>
    </div>
  );
}
