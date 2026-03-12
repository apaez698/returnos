"use client";

import { useMemo, useState } from "react";
import type { CampaignSuggestion } from "@/lib/campaigns/types";
import { CampaignSuggestionCard } from "./campaign-suggestion-card";

interface CampaignSuggestionsListProps {
  suggestions: CampaignSuggestion[];
  onSelectSuggestion: (suggestion: CampaignSuggestion) => void;
  onCreateSuggestion: (suggestion: CampaignSuggestion) => void;
  isCreatingSuggestion: boolean;
}

export function CampaignSuggestionsList({
  suggestions,
  onSelectSuggestion,
  onCreateSuggestion,
  isCreatingSuggestion,
}: CampaignSuggestionsListProps) {
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<
    number | null
  >(suggestions[0] ? 0 : null);

  const selectedSuggestion = useMemo(
    () =>
      selectedSuggestionIndex === null
        ? null
        : (suggestions[selectedSuggestionIndex] ?? null),
    [selectedSuggestionIndex, suggestions],
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Sugerencias de reactivacion
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Elige una propuesta, ajustala y crea tu campana en segundos.
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            No hay sugerencias disponibles
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Agrega clientes inactivos para generar sugerencias de campanas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {suggestions.map((suggestion, index) => {
            const isSelected = suggestion.title === selectedSuggestion?.title;

            return (
              <CampaignSuggestionCard
                key={`${suggestion.title}-${index}`}
                suggestion={suggestion}
                isSelected={isSelected}
                onCreate={onCreateSuggestion}
                isCreating={isCreatingSuggestion}
                onSelect={(pickedSuggestion) => {
                  setSelectedSuggestionIndex(index);
                  onSelectSuggestion(pickedSuggestion);
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
