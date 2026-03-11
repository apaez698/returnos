type FeatureCardProps = {
  title: string;
  description: string;
};

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <article className="rounded-2xl border border-orange-100 bg-white p-6 shadow-xs">
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-700">{description}</p>
    </article>
  );
}