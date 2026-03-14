"use client";

import { useEffect, useMemo, useState } from "react";
import { PosCustomer } from "@/lib/pos/types";

interface UsePosCustomerFlowOptions {
  initialCustomers: PosCustomer[];
  maxResults?: number;
}

export function getCreateCustomerDefaults(query: string): {
  name: string;
  phone: string;
} {
  const trimmed = query.trim();
  if (!trimmed) {
    return { name: "", phone: "" };
  }

  const isPhoneLike = /^[+\d()\s-]+$/.test(trimmed);

  if (isPhoneLike) {
    return { name: "", phone: trimmed };
  }

  return { name: trimmed, phone: "" };
}

export function usePosCustomerFlow({
  initialCustomers,
  maxResults = 8,
}: UsePosCustomerFlowOptions) {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState(initialCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomer | null>(
    null,
  );
  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] =
    useState(false);
  const [createCustomerModalKey, setCreateCustomerModalKey] = useState(0);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return customers.slice(0, maxResults);
    }

    return customers
      .filter((customer) => {
        return (
          customer.name.toLowerCase().includes(normalizedQuery) ||
          customer.phone.toLowerCase().includes(normalizedQuery)
        );
      })
      .slice(0, maxResults);
  }, [customers, maxResults, query]);

  const hasSearched = query.trim().length > 0;
  const isNotFound = hasSearched && results.length === 0;

  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  useEffect(() => {
    setSelectedCustomer((current) => {
      if (!current) {
        return current;
      }

      const stillVisible = results.some(
        (customer) => customer.id === current.id,
      );
      return stillVisible ? current : null;
    });
  }, [results]);

  function selectCustomer(customer: PosCustomer) {
    setSelectedCustomer(customer);
    setQuery(customer.name);
  }

  function openCreateCustomerModal() {
    setCreateCustomerModalKey((current) => current + 1);
    setIsCreateCustomerModalOpen(true);
  }

  function closeCreateCustomerModal() {
    setIsCreateCustomerModalOpen(false);
  }

  function handleCustomerCreated(customer: PosCustomer) {
    setCustomers((current) => [
      customer,
      ...current.filter((item) => item.id !== customer.id),
    ]);
    setSelectedCustomer(customer);
    setQuery(customer.name);
    setIsCreateCustomerModalOpen(false);
  }

  return {
    query,
    setQuery,
    customers,
    results,
    hasSearched,
    isNotFound,
    selectedCustomer,
    selectedCustomerId: selectedCustomer?.id ?? "",
    selectCustomer,
    isCreateCustomerModalOpen,
    createCustomerModalKey,
    openCreateCustomerModal,
    closeCreateCustomerModal,
    handleCustomerCreated,
    createCustomerDefaults: getCreateCustomerDefaults(query),
  };
}
