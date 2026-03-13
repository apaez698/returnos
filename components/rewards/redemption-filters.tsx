"use client";

import { useState } from "react";

interface RedemptionFiltersProps {
  onFilterChange: (filters: {
    customerSearch: string;
    startDate: string;
    endDate: string;
  }) => void;
}

export function RedemptionFilters({ onFilterChange }: RedemptionFiltersProps) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");

  const handleApplyFilters = () => {
    if (startDate && endDate && endDate < startDate) {
      setDateError(
        "La fecha «Hasta» debe ser igual o posterior a la fecha «Desde».",
      );
      return;
    }
    setDateError("");
    onFilterChange({
      customerSearch,
      startDate,
      endDate,
    });
  };

  const handleReset = () => {
    setCustomerSearch("");
    setStartDate("");
    setEndDate("");
    setDateError("");
    onFilterChange({
      customerSearch: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-900">
            Buscar cliente
          </label>
          <input
            type="text"
            placeholder="Nombre o teléfono..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900">
            Desde
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setDateError("");
            }}
            className={`mt-1 w-full rounded border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 ${dateError ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900">
            Hasta
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setDateError("");
            }}
            className={`mt-1 w-full rounded border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 ${dateError ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"}`}
          />
        </div>
      </div>

      {dateError && (
        <p className="mt-2 text-sm text-rose-600" role="alert">
          {dateError}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleApplyFilters}
          disabled={!!dateError}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Aplicar filtros
        </button>
        <button
          onClick={handleReset}
          className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
