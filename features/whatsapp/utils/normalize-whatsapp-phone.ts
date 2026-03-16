interface NormalizeWhatsAppPhoneOptions {
  defaultCountryCode?: string;
}

const SIMPLE_PHONE_SEPARATOR_REGEX = /[\s().-]+/g;

function toCountryCode(rawCountryCode: string | undefined): string {
  if (!rawCountryCode) {
    return "";
  }

  return rawCountryCode.replace(/\D/g, "");
}

export function normalizeWhatsAppPhone(
  input: string,
  options: NormalizeWhatsAppPhoneOptions = {},
): string {
  const trimmed = input.trim();

  if (!trimmed) {
    return "";
  }

  const compact = trimmed.replace(SIMPLE_PHONE_SEPARATOR_REGEX, "");
  const hasLeadingPlus = compact.startsWith("+");
  const digits = compact.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (hasLeadingPlus) {
    return `+${digits}`;
  }

  const countryCode = toCountryCode(options.defaultCountryCode);

  if (countryCode) {
    return `+${countryCode}${digits}`;
  }

  return digits;
}
