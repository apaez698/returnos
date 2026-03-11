import Link from "next/link";

type CTAButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export function CTAButton({
  href,
  children,
  variant = "primary",
}: CTAButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-orange-500"
      : "bg-white text-zinc-900 ring-1 ring-zinc-300 hover:bg-zinc-50 focus-visible:ring-zinc-500";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${styles}`}
    >
      {children}
    </Link>
  );
}