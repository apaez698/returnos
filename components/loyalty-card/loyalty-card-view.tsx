import type { LoyaltyCardViewModel } from "@/features/loyalty-card/types/loyalty-card-types";
import type { WalletPlatformAvailability } from "@/features/wallet/shared/get-wallet-platform-availability";
import { LoyaltyCardHeader } from "./loyalty-card-header";
import { LoyaltyCardPointsHero } from "./loyalty-card-points-hero";
import { LoyaltyCardProgressSection } from "./loyalty-card-progress-section";
import { LoyaltyCardStatusMessage } from "./loyalty-card-status-message";
import { LoyaltyCardQrSection } from "./loyalty-card-qr-section";
import { LoyaltyCardActions } from "./loyalty-card-actions";

interface LoyaltyCardViewProps {
  card: LoyaltyCardViewModel;
  cardToken: string;
  walletAvailability: WalletPlatformAvailability;
  businessLogoUrl?: string | null;
  qrCodeDataUrl?: string | null;
  customerIdentifier?: string;
}

function maskPhone(phone: string | null): string {
  if (!phone) {
    return "Phone not available";
  }

  const visibleDigits = phone.replace(/\D/g, "");

  if (visibleDigits.length < 4) {
    return "Phone not available";
  }

  const lastFour = visibleDigits.slice(-4);
  return `***-***-${lastFour}`;
}

function buildCustomerIdentifier(card: LoyaltyCardViewModel): string {
  const customerIdChunk = card.customer.id.slice(0, 8).toUpperCase();
  const businessSlug = card.business.slug || card.business.id.slice(0, 6);
  return `${businessSlug}-${customerIdChunk}`;
}

export function LoyaltyCardView({
  card,
  cardToken,
  walletAvailability,
  businessLogoUrl,
  qrCodeDataUrl,
  customerIdentifier,
}: LoyaltyCardViewProps) {
  const resolvedCustomerIdentifier =
    customerIdentifier ?? buildCustomerIdentifier(card);

  return (
    <section className="mx-auto w-full max-w-4xl rounded-[2rem] border border-amber-100 bg-gradient-to-br from-white via-amber-50/70 to-orange-100/70 p-3 shadow-xl shadow-amber-900/10 sm:p-4 md:p-5 lg:p-6">
      <div className="space-y-3 md:space-y-4">
        <LoyaltyCardHeader
          businessName={card.business.name}
          businessLogoUrl={businessLogoUrl}
          customerName={card.customer.name}
          maskedPhone={maskPhone(card.customer.phone)}
        />

        <div className="grid gap-3 md:grid-cols-5 md:gap-4">
          <div className="space-y-3 md:col-span-3 lg:col-span-3">
            <LoyaltyCardPointsHero
              currentPoints={card.loyalty.current_points}
            />
            <LoyaltyCardProgressSection
              currentPoints={card.loyalty.current_points}
              targetPoints={card.loyalty.reward_target_points}
              progressPercentage={card.loyalty.progress_percentage_to_target}
              remainingPoints={card.loyalty.remaining_points_to_target}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-2">
            <LoyaltyCardStatusMessage
              status={card.loyalty.status}
              redeemableRewardName={card.loyalty.redeemable_reward?.name}
              nextRewardName={card.loyalty.next_reward?.name}
              remainingPoints={card.loyalty.remaining_points_to_target}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-5 md:gap-4">
          <div className="md:col-span-3">
            <LoyaltyCardQrSection
              qrCodeDataUrl={qrCodeDataUrl}
              customerIdentifier={resolvedCustomerIdentifier}
            />
          </div>

          <div className="md:col-span-2">
            <LoyaltyCardActions
              cardToken={cardToken}
              availablePlatforms={walletAvailability}
              businessName={card.business.name}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
