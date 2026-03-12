import { describe, it, expect } from "vitest";
import {
  getBusinessTypeLabel,
  BUSINESS_TYPE_LABELS,
} from "@/lib/business/business-branding";

describe("getBusinessTypeLabel", () => {
  it("returns 'Panadería / Cafetería' for bakery type", () => {
    expect(getBusinessTypeLabel("bakery")).toBe("Panadería / Cafetería");
  });

  it("returns 'Restaurante' for restaurant type", () => {
    expect(getBusinessTypeLabel("restaurant")).toBe("Restaurante");
  });

  it("returns the raw type string for unknown business types", () => {
    expect(getBusinessTypeLabel("gym")).toBe("gym");
    expect(getBusinessTypeLabel("salon")).toBe("salon");
  });

  it("returns the raw type string for an empty string", () => {
    expect(getBusinessTypeLabel("")).toBe("");
  });

  it("matches BUSINESS_TYPE_LABELS map for every known type", () => {
    for (const [type, label] of Object.entries(BUSINESS_TYPE_LABELS)) {
      expect(getBusinessTypeLabel(type)).toBe(label);
    }
  });
});
