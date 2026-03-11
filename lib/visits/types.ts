export const visitSources = ["manual", "in_store", "qr"] as const;

export type VisitSource = (typeof visitSources)[number];

export interface RecentVisitItem {
  id: string;
  customer_id: string;
  customer_name: string;
  points_earned: number;
  amount: number | null;
  product_category: string | null;
  source: VisitSource;
  created_at: string;
}

export type VisitField =
  | "customer_id"
  | "points_earned"
  | "amount"
  | "product_category"
  | "source";

export interface VisitActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<VisitField, string>>;
}

export const initialVisitActionState: VisitActionState = {
  status: "idle",
};
