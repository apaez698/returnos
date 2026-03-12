/**
 * Validation helpers for the ReturnOS bakery demo flow.
 *
 * After seeding, these pure functions verify that the demo dataset is
 * complete and usable end-to-end. Each helper returns a ValidationResult
 * so failures can be surfaced with an explanatory message.
 *
 * All functions are side-effect free — pass data in, get a result out.
 */

import type {
  DemoBusiness,
  DemoCustomer,
  DemoVisit,
  DemoRewardRule,
  DemoMetricsSummary,
} from "@/lib/bakery-demo-types";

// ============================================================
// Shared result type
// ============================================================

export interface ValidationResult {
  ok: boolean;
  message: string;
}

// ============================================================
// Report type returned by runDemoValidation
// ============================================================

export interface DemoValidationReport {
  allValid: boolean;
  results: {
    business: ValidationResult;
    customers: ValidationResult;
    visits: ValidationResult;
    rewardRules: ValidationResult;
    dashboardMetrics: ValidationResult;
    inactiveCustomer: ValidationResult;
    rewardEligibility: ValidationResult;
    posSearch: ValidationResult;
  };
}

// ============================================================
// Individual validation helpers
// ============================================================

/**
 * Check that a business record exists and has the minimum required fields.
 */
export function validateBusinessExists(
  business: DemoBusiness | null | undefined,
): ValidationResult {
  if (!business) {
    return { ok: false, message: "Business record is missing." };
  }
  if (!business.id || !business.name || !business.slug) {
    return {
      ok: false,
      message:
        "Business record is incomplete — required fields: id, name, slug.",
    };
  }
  return { ok: true, message: `Business "${business.name}" exists.` };
}

/**
 * Check that customers were inserted: non-empty array and every record is
 * linked to the expected business.
 */
export function validateCustomersInserted(
  customers: DemoCustomer[],
  businessId: string,
): ValidationResult {
  if (customers.length === 0) {
    return { ok: false, message: "No customers found." };
  }
  const mislinked = customers.filter((c) => c.business_id !== businessId);
  if (mislinked.length > 0) {
    return {
      ok: false,
      message: `${mislinked.length} customer(s) are not linked to business "${businessId}".`,
    };
  }
  return { ok: true, message: `${customers.length} customer(s) found.` };
}

/**
 * Check that at least one visit record exists.
 */
export function validateVisitsExist(visits: DemoVisit[]): ValidationResult {
  if (visits.length === 0) {
    return { ok: false, message: "No visits found." };
  }
  return { ok: true, message: `${visits.length} visit(s) found.` };
}

/**
 * Check that reward rules exist and at least one is active.
 */
export function validateRewardRulesExist(
  rules: DemoRewardRule[],
): ValidationResult {
  if (rules.length === 0) {
    return { ok: false, message: "No reward rules found." };
  }
  const activeCount = rules.filter((r) => r.is_active).length;
  if (activeCount === 0) {
    return {
      ok: false,
      message: `${rules.length} rule(s) found but none are active.`,
    };
  }
  return {
    ok: true,
    message: `${rules.length} reward rule(s) found (${activeCount} active).`,
  };
}

/**
 * Check that the key dashboard metric fields are all non-zero:
 * totalCustomers, totalVisits, totalSales, totalPointsIssued.
 */
export function validateDashboardMetrics(
  metrics: DemoMetricsSummary,
): ValidationResult {
  const checks: Array<{ key: keyof DemoMetricsSummary; label: string }> = [
    { key: "totalCustomers", label: "totalCustomers" },
    { key: "totalVisits", label: "totalVisits" },
    { key: "totalSales", label: "totalSales" },
    { key: "totalPointsIssued", label: "totalPointsIssued" },
  ];
  for (const { key, label } of checks) {
    if ((metrics[key] as number) <= 0) {
      return {
        ok: false,
        message: `Dashboard metric "${label}" is zero or negative.`,
      };
    }
  }
  return {
    ok: true,
    message: `Dashboard metrics valid: ${metrics.totalCustomers} customers, ${metrics.totalVisits} visits, $${metrics.totalSales} in sales.`,
  };
}

/**
 * Check that at least one customer is inactive (last visit >= thresholdDays ago).
 * Uses the supplied currentDate so the helper stays pure / deterministic in tests.
 */
export function validateHasInactiveCustomer(
  customers: DemoCustomer[],
  thresholdDays = 60,
  currentDate: Date = new Date(),
): ValidationResult {
  const inactive = customers.filter((c) => {
    if (!c.last_visit_at) return true;
    const visitDate = new Date(c.last_visit_at);
    const diffDays = Math.floor(
      (currentDate.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays >= thresholdDays;
  });

  if (inactive.length === 0) {
    return {
      ok: false,
      message: `No inactive customers found (threshold: ${thresholdDays} days).`,
    };
  }
  return {
    ok: true,
    message: `${inactive.length} inactive customer(s) found (threshold: ${thresholdDays} days).`,
  };
}

/**
 * Check that at least one customer is either:
 *   - eligible (points >= an active rule's points_required), OR
 *   - near a reward unlock (points >= nearThresholdPercent% of an active rule's points_required
 *     but not yet at the threshold).
 *
 * nearThresholdPercent defaults to 80 (i.e. within 20 % of the next unlock).
 */
export function validateRewardEligibility(
  customers: DemoCustomer[],
  rules: DemoRewardRule[],
  nearThresholdPercent = 80,
): ValidationResult {
  const activeRules = rules.filter((r) => r.is_active);
  if (activeRules.length === 0) {
    return {
      ok: false,
      message: "No active reward rules to evaluate eligibility.",
    };
  }

  const eligible = customers.filter((c) =>
    activeRules.some((r) => c.points >= r.points_required),
  );

  const nearReward = customers.filter(
    (c) =>
      !activeRules.some((r) => c.points >= r.points_required) &&
      activeRules.some((r) => {
        const pct = (c.points / r.points_required) * 100;
        return pct >= nearThresholdPercent;
      }),
  );

  if (eligible.length === 0 && nearReward.length === 0) {
    return {
      ok: false,
      message: `No customers are eligible for or near a reward (${nearThresholdPercent}% threshold).`,
    };
  }
  return {
    ok: true,
    message: `${eligible.length} customer(s) eligible for a reward, ${nearReward.length} near unlock (${nearThresholdPercent}% threshold).`,
  };
}

// ============================================================
// POS search helper
// ============================================================

/**
 * Pure in-memory customer search that mirrors the POS ilike logic:
 * case-insensitive substring match on name or phone.
 *
 * Returning an empty query returns the full list (mirrors the DB behaviour).
 */
export function searchCustomersByNameOrPhone(
  customers: DemoCustomer[],
  query: string,
): DemoCustomer[] {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [...customers];
  const lower = trimmed.toLowerCase();
  return customers.filter(
    (c) =>
      c.name.toLowerCase().includes(lower) ||
      c.phone.toLowerCase().includes(lower),
  );
}

/**
 * Validate that the POS search returns at least one result for every query
 * string in the provided list.
 */
export function validatePosSearch(
  customers: DemoCustomer[],
  queries: string[],
): ValidationResult {
  if (queries.length === 0) {
    return { ok: true, message: "No POS search queries provided; skipped." };
  }

  const failing: string[] = [];
  for (const query of queries) {
    const results = searchCustomersByNameOrPhone(customers, query);
    if (results.length === 0) {
      failing.push(`"${query}"`);
    }
  }

  if (failing.length > 0) {
    return {
      ok: false,
      message: `POS search returned no results for: ${failing.join(", ")}.`,
    };
  }
  return {
    ok: true,
    message: `All ${queries.length} POS search quer${queries.length === 1 ? "y" : "ies"} returned results.`,
  };
}

// ============================================================
// Composite runner
// ============================================================

/**
 * Run all demo validations and return a single report.
 * Pass posQueries = [] to skip the POS search check.
 */
export function runDemoValidation(
  business: DemoBusiness | null | undefined,
  customers: DemoCustomer[],
  visits: DemoVisit[],
  rules: DemoRewardRule[],
  metrics: DemoMetricsSummary,
  posQueries: string[] = [],
): DemoValidationReport {
  const results = {
    business: validateBusinessExists(business),
    customers: validateCustomersInserted(customers, business?.id ?? ""),
    visits: validateVisitsExist(visits),
    rewardRules: validateRewardRulesExist(rules),
    dashboardMetrics: validateDashboardMetrics(metrics),
    inactiveCustomer: validateHasInactiveCustomer(customers),
    rewardEligibility: validateRewardEligibility(customers, rules),
    posSearch: validatePosSearch(customers, posQueries),
  };

  const allValid = Object.values(results).every((r) => r.ok);
  return { allValid, results };
}
