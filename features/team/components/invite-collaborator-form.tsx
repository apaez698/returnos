"use client";

import { useActionState, useEffect, useState } from "react";
import type { InviteCollaboratorActionState } from "@/features/team/actions/types";

interface InviteCollaboratorFormProps {
  action: (
    previousState: InviteCollaboratorActionState,
    formData: FormData,
  ) => Promise<InviteCollaboratorActionState>;
}

export function InviteCollaboratorForm({
  action,
}: InviteCollaboratorFormProps) {
  const initialState: InviteCollaboratorActionState = { status: "idle" };

  const [state, formAction, pending] = useActionState(action, initialState);
  const [formValues, setFormValues] = useState({ email: "", role: "staff" });

  useEffect(() => {
    if (state.status === "success") {
      setFormValues({ email: "", role: "staff" });
    }
  }, [state.status]);

  return (
    <form
      action={formAction}
      noValidate
      className="rounded-lg border border-slate-200 bg-white p-6"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        Invitar colaborador
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Invita por correo y define su nivel de acceso (admin o staff).
      </p>

      {state.status === "error" && state.message ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <p className="font-medium">{state.message}</p>
        </div>
      ) : null}

      {state.status === "success" && state.message ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <p className="font-medium">{state.message}</p>
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Correo del colaborador
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formValues.email}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            disabled={pending}
            placeholder="colaborador@negocio.com"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 focus:ring-2 disabled:bg-slate-100"
          />
          {state.fieldErrors?.email ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="role"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Rol
          </label>
          <select
            id="role"
            name="role"
            value={formValues.role}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                role: event.target.value,
              }))
            }
            disabled={pending}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 focus:ring-2 disabled:bg-slate-100"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          {state.fieldErrors?.role ? (
            <p className="mt-1 text-xs text-rose-600">
              {state.fieldErrors.role}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-slate-400"
      >
        {pending ? "Enviando..." : "Enviar invitacion"}
      </button>
    </form>
  );
}
