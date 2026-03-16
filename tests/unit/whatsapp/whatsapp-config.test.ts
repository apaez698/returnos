import { afterEach, describe, expect, it, vi } from "vitest";

import { getWhatsAppConfig } from "@/features/whatsapp/config/whatsapp-config";

describe("getWhatsAppConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses defaults and throws when required vars are missing while enabled", () => {
    vi.stubEnv("WHATSAPP_ENABLED", "true");
    vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "");
    vi.stubEnv("WHATSAPP_ACCESS_TOKEN", "");
    vi.stubEnv("WHATSAPP_VERIFY_TOKEN", "");
    vi.stubEnv("WHATSAPP_API_VERSION", "");

    expect(() => getWhatsAppConfig()).toThrow("WHATSAPP_PHONE_NUMBER_ID");
  });

  it("returns config without throwing when disabled", () => {
    vi.stubEnv("WHATSAPP_ENABLED", "false");
    vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "");
    vi.stubEnv("WHATSAPP_ACCESS_TOKEN", "");
    vi.stubEnv("WHATSAPP_VERIFY_TOKEN", "");
    vi.stubEnv("WHATSAPP_API_VERSION", "");

    const config = getWhatsAppConfig();

    expect(config.enabled).toBe(false);
    expect(config.apiVersion).toBe("v23.0");
    expect(config.phoneNumberId).toBe("");
    expect(config.accessToken).toBe("");
    expect(config.verifyToken).toBe("");
  });

  it("trims variables and uses explicit api version", () => {
    vi.stubEnv("WHATSAPP_ENABLED", " true ");
    vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", " 123456789 ");
    vi.stubEnv("WHATSAPP_ACCESS_TOKEN", " token-abc ");
    vi.stubEnv("WHATSAPP_VERIFY_TOKEN", " verify-123 ");
    vi.stubEnv("WHATSAPP_API_VERSION", " v21.0 ");

    const config = getWhatsAppConfig();

    expect(config).toEqual({
      enabled: true,
      phoneNumberId: "123456789",
      accessToken: "token-abc",
      apiVersion: "v21.0",
      verifyToken: "verify-123",
    });
  });
});
