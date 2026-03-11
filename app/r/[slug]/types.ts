export type PublicRegistrationResult = {
  success: boolean;
  error: string | null;
  message: string | null;
};

export const initialPublicRegistrationResult: PublicRegistrationResult = {
  success: false,
  error: null,
  message: null,
};
