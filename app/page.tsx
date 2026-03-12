import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { CTAButton } from "@/components/landing/cta-button";
import { FeatureCard } from "@/components/landing/feature-card";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:px-10 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-orange-700 uppercase">
            ReturnOS
          </p>
          <h1 className="text-4xl leading-tight font-bold text-zinc-900 sm:text-5xl lg:text-6xl">
            Fidelizacion para restaurantes que aumenta clientes recurrentes
          </h1>
          <p className="mt-5 text-base text-zinc-700 sm:text-lg">
            ReturnOS ayuda a restaurantes, cafeterias y panaderias a convertir
            visitas ocasionales en ingresos frecuentes con puntos, recompensas y
            campanas de reactivacion automatizadas.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CTAButton href="/login">Comenzar prueba gratis</CTAButton>
            <CTAButton href="/dashboard" variant="secondary">
              Ver demo del dashboard
            </CTAButton>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Tarjetas de puntos digitales"
            description="Otorga puntos en cada visita y sigue el progreso de tus clientes sin tarjetas fisicas."
          />
          <FeatureCard
            title="Campanas automaticas de reactivacion"
            description="Recupera clientes inactivos con ofertas personalizadas segun su historial de visitas."
          />
          <FeatureCard
            title="Analitica de negocio en tiempo real"
            description="Visualiza tendencias de visitas, clientes frecuentes y rendimiento de campanas en un solo lugar."
          />
        </div>
      </section>
    </main>
  );
}
