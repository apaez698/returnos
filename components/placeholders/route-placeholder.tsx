type RoutePlaceholderProps = {
  title: string;
  description?: string;
};

export function RoutePlaceholder({
  title,
  description,
}: RoutePlaceholderProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12">
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        ReturnOS
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
        {title}
      </h1>
      {description ? <p className="mt-4 text-zinc-600">{description}</p> : null}
    </main>
  );
}
