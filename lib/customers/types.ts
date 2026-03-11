export interface CustomerListItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  birthday: string | null;
  consent_marketing: boolean;
  last_visit_at: string | null;
}

export type CustomerField = "name" | "phone" | "email" | "birthday";

export interface CustomerActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<CustomerField, string>>;
}

export const initialCustomerActionState: CustomerActionState = {
  status: "idle",
};
