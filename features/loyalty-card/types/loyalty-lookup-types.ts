export interface LoyaltyLookupCustomer {
  id: string;
  name: string | null;
  phone: string | null;
  card_token: string | null;
  card_enabled?: boolean | null;
}

export interface LoyaltyLookupMatch {
  business: {
    id: string;
  };
  customer: LoyaltyLookupCustomer;
  normalized_phone: string;
}
