type TestimonialCardProps = {
  quote: string;
  businessName: string;
};

function TestimonialCard({ quote, businessName }: TestimonialCardProps) {
  return (
    <article className="rounded-2xl border border-orange-100 bg-gradient-to-br from-slate-50 to-white p-8 shadow-xs">
      <div className="mb-4 flex items-start gap-1">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="h-4 w-4 fill-orange-400" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      <blockquote className="text-base leading-relaxed text-zinc-800">
        "{quote}"
      </blockquote>

      <p className="mt-6 font-medium text-zinc-900">{businessName}</p>
    </article>
  );
}

const testimonials: TestimonialCardProps[] = [
  {
    quote: "Ahora sabemos quiénes son nuestros mejores clientes",
    businessName: "Panadería San José",
  },
  {
    quote: "Es súper fácil de usar en caja",
    businessName: "Café Aroma",
  },
  {
    quote: "Los clientes vuelven más seguido",
    businessName: "Panadería San José",
  },
];

export function SocialProof() {
  return (
    <section className="border-t border-zinc-200/50 bg-white px-6 py-20 sm:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wide text-orange-600">
            Testimonios reales
          </p>
          <h2 className="text-3xl font-bold text-zinc-950 sm:text-4xl">
            Negocios que ya están usando ReturnOS
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Descubre cómo otros negocios están logrando más con ReturnOS
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              businessName={testimonial.businessName}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
