import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureCard } from "@/components/landing/feature-card";
import { SocialProof } from "@/components/landing/social-proof";
import { FinalCTASection } from "@/components/landing/final-cta-section";
import { WhatsAppContactButton } from "@/components/landing/whatsapp-contact-button";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />

        <section id="how-it-works" className="bg-white px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-zinc-950 sm:text-4xl">
                Cómo funciona
              </h2>
              <p className="mt-4 text-lg text-zinc-600">
                En solo 3 pasos conviertes visitas en clientes recurrentes
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-zinc-900">
                  Registra la compra
                </h3>
                <p className="mt-3 leading-relaxed text-zinc-600">
                  Busca al cliente por teléfono y registra su consumo en
                  segundos.
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-zinc-900">
                  Acumula puntos automáticamente
                </h3>
                <p className="mt-3 leading-relaxed text-zinc-600">
                  ReturnOS calcula los puntos y muestra el progreso hacia la
                  próxima recompensa.
                </p>
              </article>

              <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-zinc-900">
                  Haz que regresen
                </h3>
                <p className="mt-3 leading-relaxed text-zinc-600">
                  Motiva nuevas visitas con recompensas y seguimiento simple
                  desde caja.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="benefits"
          className="border-t border-zinc-200/50 bg-gradient-to-b from-white to-slate-50 px-6 py-20 sm:px-10 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-zinc-950 sm:text-4xl">
                ¿Por qué elegir ReturnOS?
              </h2>
              <p className="mt-4 text-lg text-zinc-600">
                Todo lo que necesitas para construir relaciones duraderas con
                tus clientes
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="Tarjetas de puntos digitales"
                description="Otorga puntos en cada visita y sigue el progreso de tus clientes sin tarjetas físicas."
              />
              <FeatureCard
                title="Campañas automáticas de reactivación"
                description="Recupera clientes inactivos con ofertas personalizadas según su historial de visitas."
              />
              <FeatureCard
                title="Analítica de negocio en tiempo real"
                description="Visualiza tendencias de visitas, clientes frecuentes y rendimiento de campañas en un solo lugar."
              />
            </div>
          </div>
        </section>

        <SocialProof />

        <FinalCTASection />
      </main>
      <WhatsAppContactButton />
    </>
  );
}
