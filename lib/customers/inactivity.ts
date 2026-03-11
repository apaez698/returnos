import { CustomerListItem } from "./types";

export interface InactiveCustomer {
  customerId: string;
  name: string;
  phone: string;
  points: number;
  lastVisitAt: string | null;
  daysSinceLastVisit: number | null;
}

/**
 * Calculates the number of days between a date and now.
 * Returns null if the date is invalid or null.
 */
export function calculateDaysSinceDate(
  date: string | null,
  currentDate: Date = new Date(),
): number | null {
  if (!date) return null;

  const visitDate = new Date(date);
  if (Number.isNaN(visitDate.getTime())) return null;

  const diffMs = currentDate.getTime() - visitDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Determines if a customer is inactive based on last_visit_at.
 * A customer is inactive if:
 * - last_visit_at is null (never visited)
 * - last_visit_at is older than the threshold days
 */
export function isCustomerInactive(
  lastVisitAt: string | null,
  thresholdDays: number,
  currentDate: Date = new Date(),
): boolean {
  // If never visited, customer is inactive
  if (!lastVisitAt) return true;

  const daysSince = calculateDaysSinceDate(lastVisitAt, currentDate);
  if (daysSince === null) return true;

  return daysSince >= thresholdDays;
}

/**
 * Identifies inactive customers from a list based on days since last visit.
 * Default threshold is 14 days.
 *
 * @param customers - List of customers to check
 * @param thresholdDays - Number of days to consider as inactive threshold (default: 14)
 * @returns Array of inactive customers with computed fields
 */
export function getInactiveCustomers(
  customers: (Pick<
    CustomerListItem,
    "id" | "name" | "phone" | "last_visit_at"
  > & { points?: number })[],
  thresholdDays: number = 14,
  currentDate: Date = new Date(),
): InactiveCustomer[] {
  return customers
    .filter((customer) =>
      isCustomerInactive(customer.last_visit_at, thresholdDays, currentDate),
    )
    .map((customer) => ({
      customerId: customer.id,
      name: customer.name,
      phone: customer.phone,
      points: customer.points ?? 0,
      lastVisitAt: customer.last_visit_at,
      daysSinceLastVisit: calculateDaysSinceDate(
        customer.last_visit_at,
        currentDate,
      ),
    }))
    .sort((a, b) => {
      const daysA = a.daysSinceLastVisit ?? Number.POSITIVE_INFINITY;
      const daysB = b.daysSinceLastVisit ?? Number.POSITIVE_INFINITY;

      return daysB - daysA;
    });
}
