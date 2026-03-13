"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getEmailValidationError, normalizeEmail } from "@/lib/auth/validation";
import { createBrowserClient } from "@/lib/supabase/client";

type FormState = "idle" | "loading" | "success" | "error";

function extractRetryAfterSeconds(input: string): number {
  const match = input.match(/(\d+)\s*seconds?/i);
  if (!match) {
    return 60;
  }

  const parsed = Number.parseInt(match[1], 10);
  return Number.isNaN(parsed) ? 60 : parsed;
}

function mapAuthError(error: unknown): {
  message: string;
  retryAfterSeconds: number;
} {
  const rawMessage =
    error instanceof Error
      ? error.message
      : "No se pudo enviar el enlace. Intenta de nuevo.";

  const normalizedMessage = rawMessage.toLowerCase();

  if (
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("email rate")
  ) {
    const retryAfterSeconds = extractRetryAfterSeconds(rawMessage);

    return {
      message: `Ya se envio un enlace recientemente. Espera ${retryAfterSeconds} segundos e intenta otra vez.`,
      retryAfterSeconds,
    };
  }

  return {
    message: rawMessage,
    retryAfterSeconds: 0,
  };
}

function getAuthRedirectOrigin() {
  const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!publicAppUrl) {
    return window.location.origin;
  }

  try {
    return new URL(publicAppUrl).origin;
  } catch {
    return window.location.origin;
  }
}

export default function LoginPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);

  useEffect(() => {
    if (retryAfterSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRetryAfterSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [retryAfterSeconds]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = normalizeEmail(email);
    const validationError = getEmailValidationError(normalizedEmail);

    if (validationError) {
      setState("error");
      setMessage(validationError);
      return;
    }

    if (retryAfterSeconds > 0) {
      setState("error");
      setMessage(
        `Espera ${retryAfterSeconds} segundos antes de solicitar otro enlace.`,
      );
      return;
    }

    setState("loading");
    setMessage(null);

    try {
      const redirectUrl = new URL("/auth/callback", getAuthRedirectOrigin());
      redirectUrl.searchParams.set("next", "/dashboard");
      const currentParams = new URLSearchParams(window.location.search);

      const businessId = currentParams.get("business_id");
      const businessSlug = currentParams.get("business_slug");

      if (businessId) {
        redirectUrl.searchParams.set("business_id", businessId);
      }
      if (businessSlug) {
        redirectUrl.searchParams.set("business_slug", businessSlug);
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: redirectUrl.toString(),
        },
      });

      if (error) {
        throw error;
      }

      setState("success");
      setMessage("Revisa tu correo para abrir el enlace de acceso.");
    } catch (error) {
      const { message: authMessage, retryAfterSeconds: retrySeconds } =
        mapAuthError(error);

      setState("error");
      setRetryAfterSeconds(retrySeconds);
      setMessage(authMessage);
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
            disabled={state === "loading" || retryAfterSeconds > 0}
            className="w-full rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {state === "loading"
              ? "Enviando..."
              : retryAfterSeconds > 0
                ? `Reintentar en ${retryAfterSeconds}s`
                : "Enviar enlace"}
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
