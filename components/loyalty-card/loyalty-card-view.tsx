import type { LoyaltyCardViewModel } from "@/features/loyalty-card/types/loyalty-card-types";
import { LoyaltyCardHeader } from "./loyalty-card-header";
import { LoyaltyProgressBar } from "./loyalty-progress-bar";
import { LoyaltyRewardStatus } from "./loyalty-reward-status";
import { LoyaltyCardQr } from "./loyalty-card-qr";

interface LoyaltyCardViewProps {
  card: LoyaltyCardViewModel;
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
  businessLogoUrl,
  qrCodeDataUrl,
  customerIdentifier,
}: LoyaltyCardViewProps) {
  const resolvedCustomerIdentifier =
    customerIdentifier ?? buildCustomerIdentifier(card);

  return (
    <section className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm sm:p-6">
      <div className="space-y-4 sm:space-y-5">
        <LoyaltyCardHeader
          businessName={card.business.name}
          businessLogoUrl={businessLogoUrl}
          customerName={card.customer.name}
          maskedPhone={maskPhone(card.customer.phone)}
        />

        <LoyaltyProgressBar
          currentPoints={card.loyalty.current_points}
          targetPoints={card.loyalty.reward_target_points}
          progressPercentage={card.loyalty.progress_percentage_to_target}
          remainingPoints={card.loyalty.remaining_points_to_target}
        />

        <LoyaltyRewardStatus
          status={card.loyalty.status}
          redeemableRewardName={card.loyalty.redeemable_reward?.name}
          nextRewardName={card.loyalty.next_reward?.name}
          remainingPoints={card.loyalty.remaining_points_to_target}
        />

        <LoyaltyCardQr
          qrCodeDataUrl={qrCodeDataUrl}
          customerIdentifier={resolvedCustomerIdentifier}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Coming soon
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500"
            >
              Add to Wallet
            </button>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-500"
            >
              WhatsApp notifications
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
