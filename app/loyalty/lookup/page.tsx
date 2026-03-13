import { LoyaltyPhoneLookupForm } from "./loyalty-phone-lookup-form";

type LoyaltyLookupPageProps = {
  searchParams?: Promise<{ business_id?: string; business_slug?: string }>;
};

export default async function LoyaltyLookupPage({
  searchParams,
}: LoyaltyLookupPageProps) {
  const params = (await searchParams) ?? {};
  const businessId = params.business_id?.trim() ?? "";
  const businessSlug = params.business_slug?.trim() ?? "";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-8 sm:px-6 md:px-8 md:py-12">
      <section className="w-full rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7 md:p-10">
        <div className="grid gap-8 md:grid-cols-[1.05fr_1fr] md:items-start md:gap-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl">
              Buscar mi tarjeta
            </h1>
            <p className="mt-3 text-base leading-relaxed text-zinc-700 md:text-lg">
              Escribe tu numero de telefono para encontrar tu tarjeta de
              lealtad.
            </p>
            <p className="mt-4 rounded-xl bg-zinc-100 px-4 py-3 text-sm leading-relaxed text-zinc-700 md:text-base">
              Si tienes dudas, pide ayuda al personal y te apoyamos en el
              momento.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5 md:p-6">
            <LoyaltyPhoneLookupForm
              businessId={businessId}
              businessSlug={businessSlug}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
