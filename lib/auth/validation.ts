const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function getEmailValidationError(email: string): string | null {
  if (!email) {
    return "El correo es obligatorio.";
  }

  if (!isValidEmail(email)) {
    return "Ingresa un correo valido.";
  }

  return null;
}
