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
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-8 sm:px-6">
      <LoyaltyCardView
        card={card}
        cardToken={decodedToken}
        walletAvailability={walletAvailability}
      />
    </main>
  );
}
