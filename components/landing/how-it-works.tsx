interface HowItWorksStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
}

interface HowItWorksProps {
  title?: string;
  subtitle?: string;
}

const STEPS: HowItWorksStep[] = [
  {
    step: 1,
    icon: (
      <svg
        className="h-12 w-12 text-orange-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6v6m0 0v6m0-6h6m0 0h6M6 12H0M12 0v6m0 0v6"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 8.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 20.5A8.5 8.5 0 1 0 19.5 12"
        />
      </svg>
    ),
    title: "Registra la compra",
    description:
      "Busca al cliente por teléfono y registra el monto en segundos.",
  },
  {
    step: 2,
    icon: (
      <svg
        className="h-12 w-12 text-orange-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4.5l3 1.5"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"
        />
      </svg>
    ),
    title: "Acumula puntos automáticamente",
    description:
      "El sistema calcula puntos y muestra el progreso hacia recompensas.",
  },
  {
    step: 3,
    icon: (
      <svg
        className="h-12 w-12 text-orange-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21H3V3h9V1H3a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2v-9h-2v9Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 5h-5.5m0 0V1m0 4L12 0"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z"
        />
      </svg>
    ),
    title: "Haz que regresen",
    description:
      "Identifica clientes inactivos y envíales ofertas para que vuelvan.",
  },
];

export function HowItWorks({
  title = "Cómo funciona",
  subtitle = "Tres pasos simples para gestionar tu programa de lealtad",
}: HowItWorksProps) {
  return (
    <section
      id="how-it-works"
      className="bg-gradient-to-b from-orange-50/50 to-white px-4 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg text-zinc-600">{subtitle}</p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <article
              key={step.step}
              className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-orange-200"
            >
              {/* Step number badge */}
              <div className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600">
                {step.step}
              </div>

              {/* Icon */}
              <div className="mb-6 transition-transform duration-300 group-hover:scale-110">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-zinc-900">
                {step.title}
              </h3>

              {/* Description */}
              <p className="mt-4 leading-relaxed text-zinc-600">
                {step.description}
              </p>

              {/* Hover accent bar */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 group-hover:w-full" />
            </article>
          ))}
        </div>

        {/* Optional decorative line connecting steps */}
        <div className="hidden md:block">
          <div className="mt-12 flex justify-center gap-2">
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-orange-200 to-orange-300" />
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-orange-300 to-orange-400" />
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
