"use client";

import { FormEvent, useMemo, useState } from "react";
import { getEmailValidationError, normalizeEmail } from "@/lib/auth/validation";
import { createBrowserClient } from "@/lib/supabase/client";

type FormState = "idle" | "loading" | "success" | "error";

export default function LoginPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = normalizeEmail(email);
    const validationError = getEmailValidationError(normalizedEmail);

    if (validationError) {
      setState("error");
      setMessage(validationError);
      return;
    }

    setState("loading");
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        throw error;
      }

      setState("success");
      setMessage("Revisa tu correo para abrir el enlace de acceso.");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo enviar el enlace. Intenta de nuevo.",
      );
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
      <section className="w-full rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Iniciar sesion</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Ingresa tu correo y te enviaremos un enlace para entrar.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Correo electronico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@negocio.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (state !== "idle") {
                  setState("idle");
                  setMessage(null);
                }
              }}
              disabled={state === "loading"}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-100"
            />
          </div>

          <button
            type="submit"
            disabled={state === "loading"}
            className="w-full rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {state === "loading" ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        {state === "success" && message ? (
          <p className="mt-4 text-sm text-emerald-700" role="status">
            {message}
          </p>
        ) : null}
        {state === "error" && message ? (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {message}
          </p>
        ) : null}
      </section>
    </main>
  );
}
