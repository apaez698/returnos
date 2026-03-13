export type LoyaltyLookupState = {
  status: "idle" | "not_found" | "error";
  message: string | null;
};

export const initialLoyaltyLookupState: LoyaltyLookupState = {
  status: "idle",
  message: null,
};
