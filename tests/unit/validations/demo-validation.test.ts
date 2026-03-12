import { describe, expect, it } from "vitest";
import {
  validateBusinessExists,
  validateCustomersInserted,
  validateVisitsExist,
  validateRewardRulesExist,
  validateDashboardMetrics,
  validateHasInactiveCustomer,
  validateRewardEligibility,
  searchCustomersByNameOrPhone,
  validatePosSearch,
  runDemoValidation,
} from "@/lib/validations/demo-validation";
import type {
  DemoBusiness,
  DemoCustomer,
  DemoVisit,
  DemoRewardRule,
  DemoMetricsSummary,
} from "@/lib/bakery-demo-types";
import {
  demoBusiness,
  demoCustomers,
  demoVisits,
  demoRewardRules,
  computeDemoMetrics,
} from "@/lib/bakery-demo";

// ============================================================
// Minimal fixture builders
// ============================================================

const BIZ_ID = "biz-001";

function makeBusiness(overrides: Partial<DemoBusiness> = {}): DemoBusiness {
  return {
    id: BIZ_ID,
    name: "Café Delicia",
    slug: "cafe-delicia",
    business_type: "bakery",
    created_at: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeCustomer(
  id: string,
  overrides: Partial<DemoCustomer> = {},
): DemoCustomer {
  return {
    id,
    business_id: BIZ_ID,
    name: `Customer ${id}`,
    phone: `+521234${id}`,
    email: null,
    birthday: null,
    consent_marketing: false,
    points: 0,
    last_visit_at: "2026-03-10T00:00:00.000Z",
    created_at: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeVisit(id: string, customerId: string): DemoVisit {
  return {
    id,
    business_id: BIZ_ID,
    customer_id: customerId,
    points_earned: 5,
    amount: 5.5,
    product_category: "pastries",
    source: "in_store",
    created_at: "2026-03-10T00:00:00.000Z",
  };
}

function makeRule(
  id: string,
  pointsRequired: number,
  isActive = true,
): DemoRewardRule {
  return {
    id,
    business_id: BIZ_ID,
    name: `Reward ${id}`,
    points_required: pointsRequired,
    reward_description: "Free item",
    is_active: isActive,
    created_at: "2025-01-01T00:00:00.000Z",
  };
}

function makeMetrics(
  overrides: Partial<DemoMetricsSummary> = {},
): DemoMetricsSummary {
  return {
    totalCustomers: 10,
    activeCustomers: 8,
    inactiveCustomers: 2,
    newCustomers: 3,
    frequentCustomers: 2,
    totalVisits: 50,
    totalSales: 450.0,
    totalPointsIssued: 250,
    potentialRewardUnlocks: 3,
    customersWithRedeemableRewards: 3,
    averagePurchaseValue: 9.0,
    averagePointsPerCustomer: 25.0,
    ...overrides,
  };
}

// Reference date: "now" is March 12 2026 in our tests
const NOW = new Date("2026-03-12T00:00:00.000Z");

// ============================================================
// validateBusinessExists
// ============================================================

describe("validateBusinessExists", () => {
  it("returns ok when business has all required fields", () => {
    const result = validateBusinessExists(makeBusiness());
    expect(result.ok).toBe(true);
    expect(result.message).toContain("Café Delicia");
  });

  it("fails when business is null", () => {
    const result = validateBusinessExists(null);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/missing/i);
  });

  it("fails when business is undefined", () => {
    const result = validateBusinessExists(undefined);
    expect(result.ok).toBe(false);
  });

  it("fails when business id is empty", () => {
    const result = validateBusinessExists(makeBusiness({ id: "" }));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/incomplete/i);
  });

  it("fails when business name is empty", () => {
    const result = validateBusinessExists(makeBusiness({ name: "" }));
    expect(result.ok).toBe(false);
  });

  it("fails when business slug is empty", () => {
    const result = validateBusinessExists(makeBusiness({ slug: "" }));
    expect(result.ok).toBe(false);
  });
});

// ============================================================
// validateCustomersInserted
// ============================================================

describe("validateCustomersInserted", () => {
  it("returns ok when all customers are linked to the business", () => {
    const customers = [makeCustomer("c1"), makeCustomer("c2")];
    const result = validateCustomersInserted(customers, BIZ_ID);
    expect(result.ok).toBe(true);
    expect(result.message).toContain("2 customer(s)");
  });

  it("fails when customers array is empty", () => {
    const result = validateCustomersInserted([], BIZ_ID);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/no customers/i);
  });

  it("fails when a customer belongs to a different business", () => {
    const customers = [
      makeCustomer("c1"),
      makeCustomer("c2", { business_id: "other-biz" }),
    ];
    const result = validateCustomersInserted(customers, BIZ_ID);
    expect(result.ok).toBe(false);
    expect(result.message).toContain("1 customer(s)");
  });

  it("fails when all customers belong to a different business", () => {
    const customers = [makeCustomer("c1", { business_id: "wrong" })];
    const result = validateCustomersInserted(customers, BIZ_ID);
    expect(result.ok).toBe(false);
  });
});

// ============================================================
// validateVisitsExist
// ============================================================

describe("validateVisitsExist", () => {
  it("returns ok when visits array is non-empty", () => {
    const result = validateVisitsExist([makeVisit("v1", "c1")]);
    expect(result.ok).toBe(true);
    expect(result.message).toContain("1 visit(s)");
  });

  it("fails when visits array is empty", () => {
    const result = validateVisitsExist([]);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/no visits/i);
  });

  it("reports the correct count in the message", () => {
    const visits = Array.from({ length: 5 }, (_, i) =>
      makeVisit(`v${i}`, `c${i}`),
    );
    const result = validateVisitsExist(visits);
    expect(result.ok).toBe(true);
    expect(result.message).toContain("5 visit(s)");
  });
});

// ============================================================
// validateRewardRulesExist
// ============================================================

describe("validateRewardRulesExist", () => {
  it("returns ok with active rules present", () => {
    const result = validateRewardRulesExist([makeRule("r1", 50)]);
    expect(result.ok).toBe(true);
    expect(result.message).toContain("1 active");
  });

  it("fails when rules array is empty", () => {
    const result = validateRewardRulesExist([]);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/no reward rules/i);
  });

  it("fails when all rules are inactive", () => {
    const result = validateRewardRulesExist([
      makeRule("r1", 50, false),
      makeRule("r2", 150, false),
    ]);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/none are active/i);
  });

  it("reports the right active count", () => {
    const result = validateRewardRulesExist([
      makeRule("r1", 50, true),
      makeRule("r2", 150, false),
      makeRule("r3", 300, true),
    ]);
    expect(result.ok).toBe(true);
    expect(result.message).toContain("3 reward rule(s)");
    expect(result.message).toContain("2 active");
  });
});

// ============================================================
// validateDashboardMetrics
// ============================================================

describe("validateDashboardMetrics", () => {
  it("returns ok when all key metrics are positive", () => {
    const result = validateDashboardMetrics(makeMetrics());
    expect(result.ok).toBe(true);
    expect(result.message).toContain("10 customers");
  });

  it("fails when totalCustomers is 0", () => {
    const result = validateDashboardMetrics(makeMetrics({ totalCustomers: 0 }));
    expect(result.ok).toBe(false);
    expect(result.message).toContain("totalCustomers");
  });

  it("fails when totalVisits is 0", () => {
    const result = validateDashboardMetrics(makeMetrics({ totalVisits: 0 }));
    expect(result.ok).toBe(false);
    expect(result.message).toContain("totalVisits");
  });

  it("fails when totalSales is 0", () => {
    const result = validateDashboardMetrics(makeMetrics({ totalSales: 0 }));
    expect(result.ok).toBe(false);
    expect(result.message).toContain("totalSales");
  });

  it("fails when totalPointsIssued is 0", () => {
    const result = validateDashboardMetrics(
      makeMetrics({ totalPointsIssued: 0 }),
    );
    expect(result.ok).toBe(false);
    expect(result.message).toContain("totalPointsIssued");
  });

  it("fails when a metric is negative", () => {
    const result = validateDashboardMetrics(makeMetrics({ totalSales: -5 }));
    expect(result.ok).toBe(false);
  });
});

// ============================================================
// validateHasInactiveCustomer
// ============================================================

describe("validateHasInactiveCustomer", () => {
  it("returns ok when a customer has last_visit_at exactly at threshold", () => {
    // 60 days before reference date
    const lastVisit = new Date(NOW);
    lastVisit.setDate(lastVisit.getDate() - 60);
    const customers = [
      makeCustomer("c1", { last_visit_at: lastVisit.toISOString() }),
    ];
    const result = validateHasInactiveCustomer(customers, 60, NOW);
    expect(result.ok).toBe(true);
  });

  it("returns ok when a customer has never visited (null last_visit_at)", () => {
    const customers = [makeCustomer("c1", { last_visit_at: null })];
    const result = validateHasInactiveCustomer(customers, 60, NOW);
    expect(result.ok).toBe(true);
    expect(result.message).toContain("1 inactive");
  });

  it("returns ok when a customer's last visit is beyond the threshold", () => {
    const lastVisit = new Date(NOW);
    lastVisit.setDate(lastVisit.getDate() - 90);
    const customers = [
      makeCustomer("c1", { last_visit_at: lastVisit.toISOString() }),
    ];
    const result = validateHasInactiveCustomer(customers, 60, NOW);
    expect(result.ok).toBe(true);
  });

  it("fails when all customers visited recently", () => {
    // 2 days before NOW
    const recentVisit = new Date(NOW);
    recentVisit.setDate(recentVisit.getDate() - 2);
    const customers = [
      makeCustomer("c1", { last_visit_at: recentVisit.toISOString() }),
    ];
    const result = validateHasInactiveCustomer(customers, 60, NOW);
    expect(result.ok).toBe(false);
    expect(result.message).toContain("60 days");
  });

  it("fails when customers array is empty", () => {
    const result = validateHasInactiveCustomer([], 60, NOW);
    expect(result.ok).toBe(false);
  });

  it("uses threshold parameter correctly", () => {
    // 30 days ago — inactive under 14-day threshold, active under 60-day threshold
    const lastVisit = new Date(NOW);
    lastVisit.setDate(lastVisit.getDate() - 30);
    const customers = [
      makeCustomer("c1", { last_visit_at: lastVisit.toISOString() }),
    ];

    expect(validateHasInactiveCustomer(customers, 14, NOW).ok).toBe(true);
    expect(validateHasInactiveCustomer(customers, 60, NOW).ok).toBe(false);
  });
});

// ============================================================
// validateRewardEligibility
// ============================================================

describe("validateRewardEligibility", () => {
  it("returns ok when a customer has enough points for an active rule", () => {
    const customers = [makeCustomer("c1", { points: 100 })];
    const rules = [makeRule("r1", 50)];
    const result = validateRewardEligibility(customers, rules);
    expect(result.ok).toBe(true);
    expect(result.message).toContain("1 customer(s) eligible");
  });

  it("returns ok when a customer is near a reward (above nearThresholdPercent)", () => {
    // 85 points, rule at 100 — 85% >= default 80%
    const customers = [makeCustomer("c1", { points: 85 })];
    const rules = [makeRule("r1", 100)];
    const result = validateRewardEligibility(customers, rules);
    expect(result.ok).toBe(true);
    expect(result.message).toContain("1 near unlock");
  });

  it("fails when no customer is eligible or near a reward", () => {
    const customers = [makeCustomer("c1", { points: 10 })];
    const rules = [makeRule("r1", 100)];
    const result = validateRewardEligibility(customers, rules);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/no customers/i);
  });

  it("fails when there are no active rules", () => {
    const customers = [makeCustomer("c1", { points: 200 })];
    const rules = [makeRule("r1", 50, false)];
    const result = validateRewardEligibility(customers, rules);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/no active reward rules/i);
  });

  it("fails when rules array is empty", () => {
    const customers = [makeCustomer("c1", { points: 200 })];
    const result = validateRewardEligibility(customers, []);
    expect(result.ok).toBe(false);
  });

  it("does not double-count a customer who is both eligible and near", () => {
    // eligible takes priority — should NOT appear in nearReward count
    const customers = [makeCustomer("c1", { points: 200 })];
    const rules = [makeRule("r1", 50), makeRule("r2", 500)];
    const result = validateRewardEligibility(customers, rules);
    expect(result.ok).toBe(true);
    expect(result.message).toContain("1 customer(s) eligible");
    expect(result.message).toContain("0 near unlock");
  });

  it("respects a custom nearThresholdPercent", () => {
    // 50 points, rule at 100 — 50% which is below 80 but above 40
    const customers = [makeCustomer("c1", { points: 50 })];
    const rules = [makeRule("r1", 100)];

    expect(validateRewardEligibility(customers, rules, 80).ok).toBe(false);
    expect(validateRewardEligibility(customers, rules, 40).ok).toBe(true);
  });
});

// ============================================================
// searchCustomersByNameOrPhone
// ============================================================

describe("searchCustomersByNameOrPhone", () => {
  const customers: DemoCustomer[] = [
    makeCustomer("c1", { name: "María García López", phone: "+5255901234567" }),
    makeCustomer("c2", { name: "Juan Rodríguez", phone: "+5255912345678" }),
    makeCustomer("c3", { name: "Carmen Hernández", phone: "+5255923456789" }),
  ];

  it("returns all customers when query is empty", () => {
    expect(searchCustomersByNameOrPhone(customers, "").length).toBe(3);
  });

  it("returns all customers when query is only whitespace", () => {
    expect(searchCustomersByNameOrPhone(customers, "   ").length).toBe(3);
  });

  it("finds customers by partial name (case-insensitive)", () => {
    const results = searchCustomersByNameOrPhone(customers, "garcía");
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("c1");
  });

  it("finds customers by uppercase name fragment", () => {
    const results = searchCustomersByNameOrPhone(customers, "JUAN");
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("c2");
  });

  it("finds customers by partial phone number", () => {
    const results = searchCustomersByNameOrPhone(customers, "9234");
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("c3");
  });

  it("finds customers by full phone number", () => {
    const results = searchCustomersByNameOrPhone(customers, "+5255912345678");
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("c2");
  });

  it("returns multiple matches when query matches several customers", () => {
    // All share "+525" at the start
    const results = searchCustomersByNameOrPhone(customers, "+525");
    expect(results.length).toBe(3);
  });

  it("returns empty array when query matches nothing", () => {
    const results = searchCustomersByNameOrPhone(customers, "Zzznotfound999");
    expect(results.length).toBe(0);
  });

  it("does not mutate the original array", () => {
    const original = [...customers];
    searchCustomersByNameOrPhone(customers, "");
    expect(customers).toEqual(original);
  });
});

// ============================================================
// validatePosSearch
// ============================================================

describe("validatePosSearch", () => {
  const customers: DemoCustomer[] = [
    makeCustomer("c1", { name: "María García", phone: "+5255901234567" }),
    makeCustomer("c2", { name: "Juan Pérez", phone: "+5255912345678" }),
  ];

  it("returns ok when all queries find results", () => {
    const result = validatePosSearch(customers, ["María", "+52559012"]);
    expect(result.ok).toBe(true);
    expect(result.message).toContain("2");
  });

  it("fails when one query returns no results", () => {
    const result = validatePosSearch(customers, ["María", "nobody"]);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('"nobody"');
  });

  it("fails and lists all failing queries", () => {
    const result = validatePosSearch(customers, ["ghost1", "ghost2"]);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('"ghost1"');
    expect(result.message).toContain('"ghost2"');
  });

  it("returns ok with message when queries array is empty", () => {
    const result = validatePosSearch(customers, []);
    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/skipped/i);
  });

  it("handles a single query correctly", () => {
    const result = validatePosSearch(customers, ["Juan"]);
    expect(result.ok).toBe(true);
    expect(result.message).toContain("1");
  });
});

// ============================================================
// runDemoValidation (composite runner)
// ============================================================

describe("runDemoValidation", () => {
  const business = makeBusiness();
  const customers = [
    makeCustomer("c1", {
      points: 80,
      last_visit_at: "2026-01-01T00:00:00.000Z",
    }), // inactive
    makeCustomer("c2", {
      points: 60,
      last_visit_at: "2026-03-10T00:00:00.000Z",
    }), // active, near reward
  ];
  const visits = [makeVisit("v1", "c1"), makeVisit("v2", "c2")];
  const rules = [makeRule("r1", 50), makeRule("r2", 100)];
  const metrics = makeMetrics();

  it("reports allValid=true when the full dataset is healthy", () => {
    const report = runDemoValidation(
      business,
      customers,
      visits,
      rules,
      metrics,
    );
    expect(report.allValid).toBe(true);
  });

  it("exposes results for every check", () => {
    const report = runDemoValidation(
      business,
      customers,
      visits,
      rules,
      metrics,
    );
    expect(report.results).toHaveProperty("business");
    expect(report.results).toHaveProperty("customers");
    expect(report.results).toHaveProperty("visits");
    expect(report.results).toHaveProperty("rewardRules");
    expect(report.results).toHaveProperty("dashboardMetrics");
    expect(report.results).toHaveProperty("inactiveCustomer");
    expect(report.results).toHaveProperty("rewardEligibility");
    expect(report.results).toHaveProperty("posSearch");
  });

  it("reports allValid=false when business is missing", () => {
    const report = runDemoValidation(null, customers, visits, rules, metrics);
    expect(report.allValid).toBe(false);
    expect(report.results.business.ok).toBe(false);
  });

  it("reports allValid=false when customers are empty", () => {
    const report = runDemoValidation(business, [], visits, rules, metrics);
    expect(report.allValid).toBe(false);
    expect(report.results.customers.ok).toBe(false);
  });

  it("reports allValid=false when visits are empty", () => {
    const report = runDemoValidation(business, customers, [], rules, metrics);
    expect(report.allValid).toBe(false);
    expect(report.results.visits.ok).toBe(false);
  });

  it("includes POS search results when queries are provided", () => {
    const report = runDemoValidation(
      business,
      customers,
      visits,
      rules,
      metrics,
      ["c1"],
    );
    expect(report.results.posSearch.ok).toBe(true);
  });

  it("marks POS search as skipped when no queries are provided", () => {
    const report = runDemoValidation(
      business,
      customers,
      visits,
      rules,
      metrics,
      [],
    );
    expect(report.results.posSearch.ok).toBe(true);
    expect(report.results.posSearch.message).toMatch(/skipped/i);
  });

  it("reports allValid=false when a POS query finds no customers", () => {
    const report = runDemoValidation(
      business,
      customers,
      visits,
      rules,
      metrics,
      ["definitelynotaname"],
    );
    expect(report.allValid).toBe(false);
    expect(report.results.posSearch.ok).toBe(false);
  });

  it("validates against demo seed data without errors", () => {
    const demoMetrics = computeDemoMetrics();
    const report = runDemoValidation(
      demoBusiness,
      demoCustomers,
      demoVisits,
      demoRewardRules,
      demoMetrics,
      ["María", "+5255"],
    );

    expect(report.results.business.ok).toBe(true);
    expect(report.results.customers.ok).toBe(true);
    expect(report.results.visits.ok).toBe(true);
    expect(report.results.rewardRules.ok).toBe(true);
    expect(report.results.dashboardMetrics.ok).toBe(true);
    expect(report.results.inactiveCustomer.ok).toBe(true);
    expect(report.results.rewardEligibility.ok).toBe(true);
    expect(report.results.posSearch.ok).toBe(true);
    expect(report.allValid).toBe(true);
  });
});
