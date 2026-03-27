"use client";

import { useActionState } from "react";
import { sendTestMessageAction } from "@/app/dashboard/test-messages/actions";
import { initialSendTestMessageState } from "@/app/dashboard/test-messages/schema";

export function SendTestMessageForm() {
  const [state, formAction, isPending] = useActionState(
    sendTestMessageAction,
    initialSendTestMessageState,
  );

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="space-y-6 max-w-2xl"
    >
      {/* Estado General */}
      {state.status === "success" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">
                {state.message}
              </h3>
              {state.data && (
                <div className="mt-2 text-sm text-green-700 space-y-1">
                  <p>
                    <strong>Message SID:</strong> {state.data.messageSid}
                  </p>
                  <p>
                    <strong>Status:</strong> {state.data.status}
                  </p>
                  <p>
                    <strong>To:</strong> {state.data.to}
                  </p>
                  {state.data.mediaUrl && (
                    <p>
                      <strong>Media:</strong>{" "}
                      <a
                        href={state.data.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Ver archivo enviado
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                {state.message}
              </h3>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Número de Teléfono */}
        <div>
          <label
            htmlFor="phone_number"
            className="block text-sm font-medium text-slate-900"
          >
            Número de Teléfono
          </label>
          <input
            id="phone_number"
            name="phone_number"
            type="tel"
            placeholder="+593963247907"
            className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
              state.fieldErrors?.phone_number
                ? "border-red-300 focus:ring-red-500"
                : "border-slate-300 focus:ring-blue-500"
            }`}
            required
          />
          {state.fieldErrors?.phone_number && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.phone_number}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-600">
            Ej: +593963247907 o (555) 123-4567
          </p>
        </div>

        {/* Mensaje */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-slate-900"
          >
            Mensaje
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Escribe el mensaje que deseas enviar..."
            className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
              state.fieldErrors?.message
                ? "border-red-300 focus:ring-red-500"
                : "border-slate-300 focus:ring-blue-500"
            }`}
            required
          />
          {state.fieldErrors?.message && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.message}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-600">Máximo 1024 caracteres</p>
        </div>

        {/* URL de Imagen/Media (Opcional) */}
        <div>
          <label
            htmlFor="media_url"
            className="block text-sm font-medium text-slate-900"
          >
            URL de Imagen o Media (Opcional)
          </label>
          <input
            id="media_url"
            name="media_url"
            type="url"
            placeholder="https://example.com/image.jpg"
            className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
              state.fieldErrors?.media
                ? "border-red-300 focus:ring-red-500"
                : "border-slate-300 focus:ring-blue-500"
            }`}
          />
          {state.fieldErrors?.media && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.media}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-600">
            Si no ingresas URL, puedes subir una imagen en el campo de abajo.
          </p>
        </div>

        {/* Cargar Imagen (Opcional) */}
        <div>
          <label
            htmlFor="media_file"
            className="block text-sm font-medium text-slate-900"
          >
            Cargar Imagen (Opcional)
          </label>
          <input
            id="media_file"
            name="media_file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-blue-700 hover:file:bg-blue-100 ${
              state.fieldErrors?.media ? "border-red-300" : "border-slate-300"
            }`}
          />
          <p className="mt-1 text-xs text-slate-600">
            Formatos permitidos: JPG, PNG, WEBP, GIF (max. 5MB)
          </p>
        </div>
      </div>

      {/* Botón */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        {isPending ? "Enviando..." : "Enviar Mensaje de Prueba"}
      </button>

      {/* Info */}
      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-medium">ℹ️ Números de prueba disponibles:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li className="font-mono font-semibold text-blue-950">
            +593963247907
          </li>
          <li className="font-mono font-semibold text-blue-950">
            +593987444724
          </li>
        </ul>
        <p className="mt-3 text-xs text-blue-800">
          Estás en Twilio Sandbox. Para enviar a otros números, solicita acceso
          a producción en{" "}
          <a
            href="https://console.twilio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium text-blue-900 hover:text-blue-950"
          >
            console.twilio.com
          </a>
        </p>
      </div>
    </form>
  );
}
