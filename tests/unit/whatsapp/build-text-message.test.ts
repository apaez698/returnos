import { describe, expect, it } from "vitest";

import { buildTextMessage } from "@/features/whatsapp/service/build-text-message";

describe("buildTextMessage", () => {
  it("builds a text payload with default preview_url false", () => {
    const payload = buildTextMessage({
      to: " 573001112233 ",
      text: " Hola desde ReturnOS ",
    });

    expect(payload).toEqual({
      messaging_product: "whatsapp",
      to: "573001112233",
      type: "text",
      text: {
        body: "Hola desde ReturnOS",
        preview_url: false,
      },
    });
  });

  it("respects previewUrl when provided", () => {
    const payload = buildTextMessage({
      to: "573001112233",
      text: "Mira este enlace",
      previewUrl: true,
    });

    expect(payload.text.preview_url).toBe(true);
  });
});
