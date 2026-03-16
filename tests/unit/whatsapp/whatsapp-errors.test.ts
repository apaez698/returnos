import { describe, expect, it } from "vitest";

import {
  getErrorMessage,
  whatsappError,
  whatsappSuccess,
} from "@/features/whatsapp/utils/whatsapp-errors";

describe("whatsapp-errors helpers", () => {
  it("builds a success result", () => {
    const result = whatsappSuccess({ messageId: "wamid.123" });

    expect(result).toEqual({
      ok: true,
      data: { messageId: "wamid.123" },
    });
  });

  it("builds an error result with details", () => {
    const result = whatsappError("WHATSAPP_HTTP_ERROR", "Request failed", {
      status: 401,
      code: 190,
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "WHATSAPP_HTTP_ERROR",
        message: "Request failed",
        details: { status: 401, code: 190 },
      },
    });
  });

  it("extracts message from Error instances", () => {
    const value = getErrorMessage(new Error("Boom"), "fallback");

    expect(value).toBe("Boom");
  });

  it("returns fallback for unknown values", () => {
    const value = getErrorMessage(
      { message: "not-an-error-instance" },
      "fallback",
    );

    expect(value).toBe("fallback");
  });
});
