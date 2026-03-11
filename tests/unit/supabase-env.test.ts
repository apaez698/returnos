import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabaseEnv } from "@/lib/supabase/env";

describe("getSupabaseEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-key");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    expect(() => getSupabaseEnv()).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("throws when both key variants are missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    expect(() => getSupabaseEnv()).toThrow(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  });

  it("prefers NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY when both are present", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-publishable-key");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");

    const env = getSupabaseEnv();

    expect(env.url).toBe("https://example.supabase.co");
    expect(env.anonKey).toBe("test-publishable-key");
  });

  it("falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");

    const env = getSupabaseEnv();

    expect(env.url).toBe("https://example.supabase.co");
    expect(env.anonKey).toBe("test-anon-key");
  });

  it("returns both values when env vars are present", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-publishable-key");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");

    const env = getSupabaseEnv();

    expect(env.url).toBe("https://example.supabase.co");
    expect(env.anonKey).toBe("test-publishable-key");
  });
});
