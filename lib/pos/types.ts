export interface PosCustomer {
  id: string;
  name: string;
  phone: string;
  points: number;
  last_visit_at: string | null;
}

export interface PosRewardThreshold {
  id: string;
  name: string;
  points_required: number;
  is_active: boolean;
}

export type PosPurchaseField = "customer_id" | "amount";

export interface PosPurchaseReceipt {
  customerId: string;
  customerName: string;
  amount: number;
  pointsEarned: number;
  updatedPoints: number;
  unlockedRewardName: string | null;
  cardToken?: string | null;
}

export interface PosPurchaseActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<PosPurchaseField, string>>;
  receipt?: PosPurchaseReceipt;
}

export const initialPosPurchaseActionState: PosPurchaseActionState = {
  status: "idle",
};
