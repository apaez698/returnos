const STEPS = [
  {
    title: "1. Crea tu negocio",
    description: "Agrega el nombre de tu panaderia o cafeteria.",
  },
  {
    title: "2. Configura tu cuenta",
    description: "Te vinculamos automaticamente como owner del negocio.",
  },
  {
    title: "3. Empieza en dashboard",
    description: "Registra visitas, clientes y recompensas desde hoy.",
  },
];

export function OnboardingSteps() {
  return (
    <ol className="space-y-3">
      {STEPS.map((step) => (
        <li
          key={step.title}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <h2 className="text-sm font-semibold text-slate-900">{step.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
