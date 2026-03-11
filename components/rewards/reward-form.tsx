"use client";

import { useActionState, useEffect, useState } from "react";
import {
  RewardActionState,
  initialRewardActionState,
} from "@/lib/rewards/types";

interface RewardFormProps {
  action: (
    previousState: RewardActionState,
    formData: FormData,
  ) => Promise<RewardActionState>;
}

export function RewardForm({ action }: RewardFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialRewardActionState,
  );
  const [formValues, setFormValues] = useState({
    name: "",
    points_required: "",
    reward_description: "",
    is_active: true,
  });

  useEffect(() => {
    if (state.status === "success") {
      setFormValues({
        name: "",
        points_required: "",
        reward_description: "",
        is_active: true,
      });
    }
  }, [state.status]);

  return (
    <form
      action={formAction}
      noValidate
      className="rounded-lg border border-slate-200 bg-white p-6"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        Crear regla de recompensa
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Define cuántos puntos necesita un cliente para obtener una recompensa.
      </p>

      {state.status === "error" && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <p className="font-medium">{state.message}</p>
        </div>
      )}

      {state.status === "success" && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <p className="font-medium">{state.message}</p>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Nombre de la recompensa
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Café gratis"
            value={formValues.name}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            disabled={pending}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-indigo-500 focus:ring-2 disabled:bg-slate-100 disabled:text-slate-400"
          />
          {state.fieldErrors?.name ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.name}
            </p>
          ) : null}
        </div>

        {/* Points Required */}
        <div>
          <label
            htmlFor="points_required"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Puntos requeridos
          </label>
          <input
            id="points_required"
            name="points_required"
            type="number"
            required
            min="1"
            placeholder="50"
            value={formValues.points_required}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                points_required: event.target.value,
              }))
            }
            disabled={pending}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-indigo-500 focus:ring-2 disabled:bg-slate-100 disabled:text-slate-400"
          />
          {state.fieldErrors?.points_required ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.points_required}
            </p>
          ) : null}
        </div>

        {/* Reward Description */}
        <div className="md:col-span-2">
          <label
            htmlFor="reward_description"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Descripción de la recompensa
          </label>
          <textarea
            id="reward_description"
            name="reward_description"
            required
            rows={3}
            placeholder="Describe qué obtiene el cliente: café gratis, postre, etc."
            value={formValues.reward_description}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                reward_description: event.target.value,
              }))
            }
            disabled={pending}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-indigo-500 focus:ring-2 disabled:bg-slate-100 disabled:text-slate-400"
          />
          {state.fieldErrors?.reward_description ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.reward_description}
            </p>
          ) : null}
        </div>

        {/* Active Checkbox */}
        <div className="md:col-span-2 flex items-center gap-2">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={formValues.is_active}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                is_active: event.target.checked,
              }))
            }
            disabled={pending}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
          />
          <label
            htmlFor="is_active"
            className="text-sm font-medium text-slate-700"
          >
            Activar recompensa
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white outline-none ring-indigo-500 hover:bg-indigo-700 focus:ring-2 disabled:bg-slate-400"
      >
        {pending ? "Guardando..." : "Crear recompensa"}
      </button>
    </form>
  );
}
