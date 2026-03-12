export interface OnboardingActionState {
  status: "idle" | "error";
  message: string | null;
  fieldErrors?: {
    businessName?: string;
    businessType?: string;
  };
}

export const initialOnboardingActionState: OnboardingActionState = {
  status: "idle",
  message: null,
};
