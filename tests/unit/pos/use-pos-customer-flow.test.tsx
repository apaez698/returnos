import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePosCustomerFlow } from "@/components/pos/use-pos-customer-flow";
import { PosCustomer } from "@/lib/pos/types";

const CUSTOMERS: PosCustomer[] = [
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

describe("usePosCustomerFlow", () => {
  it("manages searched customer state and filters by query", () => {
    const { result } = renderHook(() =>
      usePosCustomerFlow({ initialCustomers: CUSTOMERS }),
    );

    expect(result.current.results).toHaveLength(3);
    expect(result.current.hasSearched).toBe(false);

    act(() => {
      result.current.setQuery("ana");
    });

    expect(result.current.hasSearched).toBe(true);
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].name).toBe("Ana Perez");
  });

  it("manages not-found state when there are no matching results", () => {
    const { result } = renderHook(() =>
      usePosCustomerFlow({ initialCustomers: CUSTOMERS }),
    );

    act(() => {
      result.current.setQuery("zzzz");
    });

    expect(result.current.hasSearched).toBe(true);
    expect(result.current.results).toHaveLength(0);
    expect(result.current.isNotFound).toBe(true);
  });

  it("manages create-customer modal open and close state", () => {
    const { result } = renderHook(() =>
      usePosCustomerFlow({ initialCustomers: CUSTOMERS }),
    );

    expect(result.current.isCreateCustomerModalOpen).toBe(false);
    expect(result.current.createCustomerModalKey).toBe(0);

    act(() => {
      result.current.openCreateCustomerModal();
    });

    expect(result.current.isCreateCustomerModalOpen).toBe(true);
    expect(result.current.createCustomerModalKey).toBe(1);

    act(() => {
      result.current.closeCreateCustomerModal();
    });

    expect(result.current.isCreateCustomerModalOpen).toBe(false);
  });

  it("selects the newly created customer after successful inline creation", () => {
    const { result } = renderHook(() =>
      usePosCustomerFlow({ initialCustomers: CUSTOMERS }),
    );

    act(() => {
      result.current.openCreateCustomerModal();
    });

    const newCustomer: PosCustomer = {
      id: "c4",
      name: "Mario Luna",
      phone: "+524444444444",
      points: 0,
      last_visit_at: null,
    };

    act(() => {
      result.current.handleCustomerCreated(newCustomer);
    });

    expect(result.current.isCreateCustomerModalOpen).toBe(false);
    expect(result.current.selectedCustomer).toEqual(newCustomer);
    expect(result.current.selectedCustomerId).toBe("c4");
    expect(result.current.query).toBe("Mario Luna");
    expect(result.current.customers[0]).toEqual(newCustomer);
    expect(result.current.results[0]).toEqual(newCustomer);
  });
});
