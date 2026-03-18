import type { CampaignSuggestion } from "@/lib/campaigns/types";

function getAudienceLabel(audienceType: CampaignSuggestion["audienceType"]) {
  if (audienceType === "inactive_customers") {
    return "Clientes inactivos";
  }

  return audienceType;
}

interface CampaignSuggestionCardProps {
  suggestion: CampaignSuggestion;
  isSelected: boolean;
  onSelect: (suggestion: CampaignSuggestion) => void;
  onCreate: (suggestion: CampaignSuggestion) => void;
  isCreating: boolean;
}

export function CampaignSuggestionCard({
  suggestion,
  isSelected,
  onSelect,
  onCreate,
  isCreating,
}: CampaignSuggestionCardProps) {
  return (
    <article
      className={`rounded-lg border bg-white p-4 transition ${
        isSelected
          ? "border-indigo-400"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <h3 className="text-base font-semibold text-slate-900">
        {suggestion.title}
      </h3>

      <p className="mt-3 text-sm text-slate-700">{suggestion.message}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-md bg-slate-100 px-2.5 py-1">
          Audiencia: {getAudienceLabel(suggestion.audienceType)}
        </span>
        <span className="rounded-md bg-slate-100 px-2.5 py-1">
          Inactividad: {suggestion.targetInactiveDays}+ días
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect(suggestion)}
          className={`inline-flex rounded-md px-3 py-1.5 text-xs font-medium transition ${
            isSelected
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-slate-900 text-white hover:bg-slate-700"
          }`}
        >
          {isSelected ? "Sugerencia seleccionada" : "Usar sugerencia"}
        </button>

        <button
          type="button"
          onClick={() => onCreate(suggestion)}
          disabled={isCreating}
          className="inline-flex rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCreating ? "Creando..." : "Crear desde sugerencia"}
        </button>
      </div>
    </article>
  );
}
