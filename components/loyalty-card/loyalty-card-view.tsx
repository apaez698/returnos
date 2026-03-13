import type { LoyaltyCardViewModel } from "@/features/loyalty-card/types/loyalty-card-types";
import type { WalletPlatformAvailability } from "@/features/wallet/shared/get-wallet-platform-availability";
import { LoyaltyCardHeader } from "./loyalty-card-header";
import { LoyaltyProgressBar } from "./loyalty-progress-bar";
import { LoyaltyRewardStatus } from "./loyalty-reward-status";
import { LoyaltyCardQr } from "./loyalty-card-qr";
import { AddToWalletButtons } from "./add-to-wallet-buttons";

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
  const hasWalletActions =
    walletAvailability.apple || walletAvailability.google;

  return (
    <section className="mx-auto w-full max-w-2xl rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-b from-white via-white to-slate-100 p-3.5 shadow-lg shadow-slate-200/60 sm:p-4 md:p-5">
      <div className="space-y-3.5 md:space-y-4">
        <LoyaltyCardHeader
          businessName={card.business.name}
          businessLogoUrl={businessLogoUrl}
          customerName={card.customer.name}
          maskedPhone={maskPhone(card.customer.phone)}
        />

        <div className="grid gap-3.5 md:grid-cols-5 md:gap-4">
          <div className="md:col-span-3">
            <LoyaltyProgressBar
              currentPoints={card.loyalty.current_points}
              targetPoints={card.loyalty.reward_target_points}
              progressPercentage={card.loyalty.progress_percentage_to_target}
              remainingPoints={card.loyalty.remaining_points_to_target}
            />
          </div>

          <div className="md:col-span-2">
            <LoyaltyRewardStatus
              status={card.loyalty.status}
              redeemableRewardName={card.loyalty.redeemable_reward?.name}
              nextRewardName={card.loyalty.next_reward?.name}
              remainingPoints={card.loyalty.remaining_points_to_target}
            />
          </div>
        </div>

        {hasWalletActions ? (
          <div className="grid gap-3.5 md:grid-cols-5 md:gap-4">
            <div className="md:col-span-3">
              <LoyaltyCardQr
                qrCodeDataUrl={qrCodeDataUrl}
                customerIdentifier={resolvedCustomerIdentifier}
              />
            </div>

            <div className="md:col-span-2">
              <AddToWalletButtons
                cardToken={cardToken}
                availablePlatforms={walletAvailability}
              />
            </div>
          </div>
        ) : (
          <LoyaltyCardQr
            qrCodeDataUrl={qrCodeDataUrl}
            customerIdentifier={resolvedCustomerIdentifier}
          />
        )}
      </div>
    </section>
  );
}
