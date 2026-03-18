"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/landing/navbar";
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
    <>
      <Navbar logoOnly />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-50 px-4 py-10">
        <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold tracking-[0.24em] text-zinc-500">
              RETURNOS
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-zinc-900">
              Iniciar sesion
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Accede a tu panel de gestion.
            </p>
          </div>

          {state === "success" ? (
            <div className="space-y-4 text-center">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-700">
                  Te enviamos un enlace a tu correo para iniciar sesion
                </p>
              </div>
              <p className="text-sm text-zinc-600">
                Revisa tu correo y haz clic en el enlace para acceder a tu
                cuenta.
              </p>
              <button
                type="button"
                onClick={() => {
                  setState("idle");
                  setMessage(null);
                }}
                className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline"
              >
                Intentar con otro correo
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (state !== "idle") {
                      setState("idle");
                      setMessage(null);
                    }
                  }}
                  disabled={state === "loading"}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
              </div>

              {state === "error" && message ? (
                <p
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  role="alert"
                >
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={state === "loading" || retryAfterSeconds > 0}
                className="mt-1 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {state === "loading"
                  ? "Enviando..."
                  : retryAfterSeconds > 0
                    ? `Reintentar en ${retryAfterSeconds}s`
                    : "Enviar enlace de acceso"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-zinc-600">
            No tienes cuenta?{" "}
            <Link
              href="/signup"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline"
            >
              Crear cuenta
            </Link>
          </p>

          <p className="mt-3 text-center text-sm text-zinc-600">
            <Link
              href="/"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline"
            >
              Volver al inicio
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}
