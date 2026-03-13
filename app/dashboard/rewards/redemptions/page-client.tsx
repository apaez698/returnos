"use client";

import { useState } from "react";
import { RedemptionsTable } from "@/components/rewards/redemptions-table";
import { RedemptionFilters } from "@/components/rewards/redemption-filters";
import { RedemptionsEmptyState } from "@/components/rewards/redemptions-empty-state";
import { RedemptionItem } from "@/lib/rewards/redemptions-types";

interface RedemptionsPageProps {
  initialRedemptions: RedemptionItem[];
  error?: string | null;
}

export default function RedemptionsPageClient({
  initialRedemptions,
  error,
}: RedemptionsPageProps) {
  const [filteredRedemptions, setFilteredRedemptions] =
    useState(initialRedemptions);

  const handleFilterChange = (filters: {
    customerSearch: string;
    startDate: string;
    endDate: string;
  }) => {
    let results = initialRedemptions;

    // Filter by customer search
    if (filters.customerSearch) {
      const searchTerm = filters.customerSearch.toLowerCase();
      results = results.filter(
        (redemption) =>
          redemption.customer_name.toLowerCase().includes(searchTerm) ||
          (redemption.customer_phone?.toLowerCase().includes(searchTerm) ??
            false),
      );
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      results = results.filter(
        (redemption) => new Date(redemption.redeemed_at) >= startDate,
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      results = results.filter(
        (redemption) => new Date(redemption.redeemed_at) <= endDate,
      );
    }

    setFilteredRedemptions(results);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <p className="mt-2 text-slate-600">
          Visualiza todas las recompensas que han sido canjeadas por tus
          clientes.
        </p>
      </section>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-medium">No se pueden cargar los canjes</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Filters */}
      {!error && (
        <>
          <RedemptionFilters onFilterChange={handleFilterChange} />

          {/* Results */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Canjes</h2>
              <p className="text-sm text-slate-600">
                {filteredRedemptions.length} de {initialRedemptions.length}
              </p>
            </div>

            {filteredRedemptions.length === 0 ? (
              <RedemptionsEmptyState />
            ) : (
              <RedemptionsTable redemptions={filteredRedemptions} />
            )}
          </section>
        </>
      )}
    </div>
  );
}
