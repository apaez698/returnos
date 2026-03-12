export const BUSINESS_TYPE_LABELS: Record<string, string> = {
  bakery: "Panadería / Cafetería",
  restaurant: "Restaurante",
};

/**
 * Returns the human-readable display label for a business type.
 * Falls back to the raw type string for unknown types.
 */
export function getBusinessTypeLabel(type: string): string {
  return BUSINESS_TYPE_LABELS[type] ?? type;
}
