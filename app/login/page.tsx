"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Completa tu correo y contrasena para continuar.");
      return;
    }

    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!looksLikeEmail) {
      setError("Ingresa un correo valido.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Simulate request latency to expose the loading state in UI.
      await new Promise((resolve) => window.setTimeout(resolve, 800));
    } catch {
      setError("No se pudo iniciar sesion. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
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
                if (error) {
                  setError(null);
                }
              }}
              disabled={isLoading}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-zinc-700"
            >
              Contrasena
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) {
                  setError(null);
                }
              }}
              disabled={isLoading}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-100"
            />
          </div>

          {error ? (
            <p
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {isLoading ? "Iniciando..." : "Iniciar sesion"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          No tienes cuenta?{" "}
          <Link
            href="/signup"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline"
          >
            Crear cuenta
          </Link>
        </p>
      </section>
    </main>
  );
}
