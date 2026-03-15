import { notFound } from "next/navigation";
import { LoyaltyCardView } from "@/components/loyalty-card/loyalty-card-view";
import { getLoyaltyCardByToken } from "@/features/loyalty-card/queries/get-loyalty-card-by-token";
import { getWalletPlatformAvailability } from "@/features/wallet/shared/get-wallet-platform-availability";

type LoyaltyCardPageProps = {
  params: Promise<{ token: string }>;
};

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export default async function LoyaltyCardPage({
  params,
}: LoyaltyCardPageProps) {
  const { token } = await params;
  const decodedToken = safeDecodeURIComponent(token);

  if (!decodedToken || decodedToken.trim().length === 0) {
    notFound();
  }

  const card = await getLoyaltyCardByToken(decodedToken);

  if (!card) {
    notFound();
  }

  const walletAvailability = getWalletPlatformAvailability();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#ffedd5_42%,_#ffffff_100%)] px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <LoyaltyCardView
          card={card}
          cardToken={decodedToken}
          walletAvailability={walletAvailability}
        />
      </div>
    </main>
  );
}
