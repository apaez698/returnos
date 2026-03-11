import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getInactiveCustomers } from "@/lib/customers/inactivity";

function daysAgoIso(days: number): string {
  const date = new Date("2025-03-11T12:00:00Z");
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

describe("getInactiveCustomers", () => {
  const currentDate = new Date("2025-03-11T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(currentDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("1 customer visited 3 days ago -> active", () => {
    const result = getInactiveCustomers(
      [
        {
          id: "cust-1",
          name: "Customer 1",
          phone: "555-0001",
          points: 10,
          last_visit_at: daysAgoIso(3),
        },
      ],
      14,
      currentDate,
    );

    expect(result).toEqual([]);
  });

  it("2 customer visited 14 days ago -> inactive", () => {
    const result = getInactiveCustomers(
      [
        {
          id: "cust-2",
          name: "Customer 2",
          phone: "555-0002",
          points: 20,
          last_visit_at: daysAgoIso(14),
        },
      ],
      14,
      currentDate,
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.customerId).toBe("cust-2");
    expect(result[0]?.daysSinceLastVisit).toBe(14);
  });

  it("3 customer visited 20 days ago -> inactive", () => {
    const result = getInactiveCustomers(
      [
        {
          id: "cust-3",
          name: "Customer 3",
          phone: "555-0003",
          points: 30,
          last_visit_at: daysAgoIso(20),
        },
      ],
      14,
      currentDate,
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.customerId).toBe("cust-3");
    expect(result[0]?.daysSinceLastVisit).toBe(20);
  });

  it("4 customer never visited -> inactive", () => {
    const result = getInactiveCustomers(
      [
        {
          id: "cust-4",
          name: "Customer 4",
          phone: "555-0004",
          points: 40,
          last_visit_at: null,
        },
      ],
      14,
      currentDate,
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.customerId).toBe("cust-4");
    expect(result[0]?.daysSinceLastVisit).toBeNull();
  });

  it("5 multiple customers sorted by inactivity", () => {
    const result = getInactiveCustomers(
      [
        {
          id: "active-3d",
          name: "Active",
          phone: "555-0100",
          points: 1,
          last_visit_at: daysAgoIso(3),
        },
        {
          id: "inactive-14d",
          name: "Inactive 14",
          phone: "555-0101",
          points: 2,
          last_visit_at: daysAgoIso(14),
        },
        {
          id: "inactive-20d",
          name: "Inactive 20",
          phone: "555-0102",
          points: 3,
          last_visit_at: daysAgoIso(20),
        },
        {
          id: "never-visited",
          name: "Never",
          phone: "555-0103",
          points: 4,
          last_visit_at: null,
        },
      ],
      14,
      currentDate,
    );

    expect(result.map((customer) => customer.customerId)).toEqual([
      "never-visited",
      "inactive-20d",
      "inactive-14d",
    ]);
  });

  it("6 uses provided currentDate instead of system time", () => {
    const fixedDate = new Date("2025-05-01T00:00:00Z");

    const result = getInactiveCustomers(
      [
        {
          id: "cust-6",
          name: "Customer 6",
          phone: "555-0006",
          points: 15,
          last_visit_at: "2025-04-17T00:00:00Z",
        },
      ],
      14,
      fixedDate,
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.daysSinceLastVisit).toBe(14);
  });
});
