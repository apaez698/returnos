const SIMPLE_PHONE_SEPARATOR_REGEX = /[\s().-]+/g;

export function normalizePhone(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.replace(SIMPLE_PHONE_SEPARATOR_REGEX, "");
}
