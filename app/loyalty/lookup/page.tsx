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
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8 sm:px-6">
      <section className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Buscar mi tarjeta
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-700">
          Escribe tu numero de telefono para encontrar tu tarjeta de lealtad.
        </p>

        <div className="mt-6">
          <LoyaltyPhoneLookupForm
            businessId={businessId}
            businessSlug={businessSlug}
          />
        </div>
      </section>
    </main>
  );
}
