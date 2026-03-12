import { describe, expect, it } from "vitest";
import { searchCustomersByNameOrPhone } from "@/lib/pos/calculations";
import { PosCustomer } from "@/lib/pos/types";

const customers: PosCustomer[] = [
  {
    id: "c1",
    name: "Ana Perez",
    phone: "+521111111111",
    points: 20,
    last_visit_at: null,
  },
  {
    id: "c2",
    name: "Carlos Diaz",
    phone: "+522222222222",
    points: 10,
    last_visit_at: null,
  },
  {
    id: "c3",
    name: "Laura Gomez",
    phone: "+523333333333",
    points: 5,
    last_visit_at: null,
  },
];

describe("searchCustomersByNameOrPhone", () => {
  it("returns all customers when query is empty", () => {
    const result = searchCustomersByNameOrPhone(customers, "");
    expect(result).toHaveLength(3);
  });

  it("finds customers by name", () => {
    const result = searchCustomersByNameOrPhone(customers, "ana");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Ana Perez");
  });

  it("finds customers by phone", () => {
    const result = searchCustomersByNameOrPhone(customers, "2222");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Carlos Diaz");
  });

  it("is case-insensitive and trims spaces", () => {
    const result = searchCustomersByNameOrPhone(customers, "  LAURA ");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Laura Gomez");
  });

  it("returns empty list when no matches", () => {
    const result = searchCustomersByNameOrPhone(customers, "zzzz");
    expect(result).toHaveLength(0);
  });
});
