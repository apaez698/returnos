"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import type {
  CampaignActionState,
  CampaignSuggestion,
} from "@/lib/campaigns/types";
import { initialCampaignActionState } from "@/lib/campaigns/types";
import { CampaignSuggestionsList } from "./campaign-suggestions-list";

interface CampaignFormProps {
  action: (
    previousState: CampaignActionState,
    formData: FormData,
  ) => Promise<CampaignActionState>;
  suggestions: CampaignSuggestion[];
}

export function CampaignForm({ action, suggestions }: CampaignFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialCampaignActionState,
  );
  const [isCreatingFromSuggestion, startCreateFromSuggestion] = useTransition();

  const defaultSuggestion = useMemo(() => suggestions[0], [suggestions]);

  const [selectedSuggestion, setSelectedSuggestion] =
    useState<CampaignSuggestion | null>(defaultSuggestion ?? null);

  const [formValues, setFormValues] = useState({
    name: defaultSuggestion?.title ?? "",
    message: defaultSuggestion?.message ?? "",
    campaign_type: defaultSuggestion?.campaignType ?? "reactivation",
    audience_type: defaultSuggestion?.audienceType ?? "inactive_customers",
    target_inactive_days:
      String(defaultSuggestion?.targetInactiveDays ?? 14) ?? "14",
  });

  useEffect(() => {
    if (state.status === "success") {
      setSelectedSuggestion(defaultSuggestion ?? null);
      setFormValues({
        name: defaultSuggestion?.title ?? "",
        message: defaultSuggestion?.message ?? "",
        campaign_type: defaultSuggestion?.campaignType ?? "reactivation",
        audience_type: defaultSuggestion?.audienceType ?? "inactive_customers",
        target_inactive_days: String(
          defaultSuggestion?.targetInactiveDays ?? 14,
        ),
      });
    }
  }, [defaultSuggestion, state.status]);

  function applySuggestion(suggestion: CampaignSuggestion) {
    setSelectedSuggestion(suggestion);
    setFormValues({
      name: suggestion.title,
      message: suggestion.message,
      campaign_type: suggestion.campaignType,
      audience_type: suggestion.audienceType,
      target_inactive_days: String(suggestion.targetInactiveDays),
    });
  }

  function createFromSuggestion(suggestion: CampaignSuggestion) {
    applySuggestion(suggestion);

    const suggestionFormData = new FormData();
    suggestionFormData.set("name", suggestion.title);
    suggestionFormData.set("message", suggestion.message);
    suggestionFormData.set("campaign_type", suggestion.campaignType);
    suggestionFormData.set("audience_type", suggestion.audienceType);
    suggestionFormData.set(
      "target_inactive_days",
      String(suggestion.targetInactiveDays),
    );

    startCreateFromSuggestion(() => {
      formAction(suggestionFormData);
    });
  }

  return (
    <div className="space-y-6">
      <CampaignSuggestionsList
        suggestions={suggestions}
        onSelectSuggestion={applySuggestion}
        onCreateSuggestion={createFromSuggestion}
        isCreatingSuggestion={pending || isCreatingFromSuggestion}
      />

      <form
        action={formAction}
        noValidate
        className="rounded-lg border border-slate-200 bg-white p-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">Editar y crear</h2>
        <p className="mt-1 text-sm text-slate-600">
          Tambien puedes editar el titulo y mensaje antes de guardar. Todas las
          campanas de esta pagina se crean para clientes inactivos.
        </p>

        {state.status === "error" && state.message ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {state.message}
          </div>
        ) : null}

        {state.status === "success" && state.message ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {state.message}
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-1 gap-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Titulo de campana
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formValues.name}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              disabled={pending}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 focus:ring-2"
            />
            {state.fieldErrors?.name ? (
              <p className="mt-1 text-xs text-rose-600">
                {state.fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="message"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Mensaje
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formValues.message}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
              disabled={pending}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 focus:ring-2"
            />
            {state.fieldErrors?.message ? (
              <p className="mt-1 text-xs text-rose-600">
                {state.fieldErrors.message}
              </p>
            ) : null}
          </div>
        </div>

        <input
          type="hidden"
          name="campaign_type"
          value={formValues.campaign_type}
        />
        <input
          type="hidden"
          name="audience_type"
          value={formValues.audience_type}
        />
        <input
          type="hidden"
          name="target_inactive_days"
          value={formValues.target_inactive_days}
        />

        {selectedSuggestion ? (
          <p className="mt-4 text-xs text-slate-500">
            Sugerencia activa: {selectedSuggestion.title}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Guardando..." : "Crear campana"}
        </button>
      </form>
    </div>
  );
}
