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

        {/* Features Section */}
        <section className="border-t border-zinc-200/50 bg-gradient-to-b from-white to-slate-50 px-6 py-20 sm:px-10 lg:py-28">
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
