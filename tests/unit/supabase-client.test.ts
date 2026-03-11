/**
 * Integration-style test: verifies that createBrowserClient builds a usable
 * Supabase client when environment variables are properly configured.
 *
 * This does NOT make a real network request — it validates the wiring between
 * env validation, client construction, and the returned API surface.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { createBrowserClient } from "@/lib/supabase/client";

const VALID_URL = "https://pbmisqrmpofkcqoobqdv.supabase.co";
const FAKE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake";

describe("createBrowserClient — environment integration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when env vars are absent", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    expect(() => createBrowserClient()).toThrow(
      "Missing env var: NEXT_PUBLIC_SUPABASE_URL",
    );
  });

  it("returns a client with correct API surface when env vars are valid", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", VALID_URL);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", FAKE_ANON_KEY);

    const client = createBrowserClient();

    expect(client).toBeDefined();
    expect(typeof client.from).toBe("function");
    expect(typeof client.auth.signInWithPassword).toBe("function");
    expect(typeof client.auth.signOut).toBe("function");
  });
});
