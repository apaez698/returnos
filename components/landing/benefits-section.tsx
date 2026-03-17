import React from "react";

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        {description}
      </p>
    </div>
  );
}

// SVG Icons
function FrequencyIcon() {
  return (
    <svg
      className="h-6 w-6 text-orange-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg
      className="h-6 w-6 text-orange-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 19H9a6 6 0 016-6h.01M21 19v-2a6 6 0 00-6-6h-6a6 6 0 00-6 6v2"
      />
    </svg>
  );
}

function SimplexIcon() {
  return (
    <svg
      className="h-6 w-6 text-orange-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function QuickStartIcon() {
  return (
    <svg
      className="h-6 w-6 text-orange-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

export function BenefitsSection() {
  const benefits: BenefitCardProps[] = [
    {
      icon: <FrequencyIcon />,
      title: "Aumenta la frecuencia de compra",
      description:
        "Recompensa la lealtad de tus clientes y haz que vuelvan más seguido con nuestro sistema de puntos inteligente.",
    },
    {
      icon: <CustomersIcon />,
      title: "Conoce a tus clientes",
      description:
        "Obtén información valiosa sobre el comportamiento y preferencias de tus clientes para mejorar tu negocio.",
    },
    {
      icon: <SimplexIcon />,
      title: "Sin complicaciones",
      description:
        "Interfaz simple y fácil de usar. Sin configuraciones técnicas complicadas, solo lo que necesitas.",
    },
    {
      icon: <QuickStartIcon />,
      title: "Funciona desde el primer día",
      description:
        "Comienza a usar ReturnOS inmediatamente. Setup rápido y sin requisitos adicionales.",
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
            Beneficios para tu negocio
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            ReturnOS te ayuda a crecer con menos esfuerzo
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
