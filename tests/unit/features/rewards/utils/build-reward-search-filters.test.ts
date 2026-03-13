import { describe, expect, it } from "vitest";
import {
  buildRewardSearchFilters,
  escapeLikePattern,
  getRewardStatusLabel,
} from "@/features/rewards/utils/build-reward-search-filters";

describe("escapeLikePattern", () => {
  it("escapes special LIKE characters", () => {
    expect(escapeLikePattern("ana%_\\phone")).toBe("ana\\%\\_\\\\phone");
  });
});

describe("buildRewardSearchFilters", () => {
  it("normalizes defaults", () => {
    const filters = buildRewardSearchFilters();

    expect(filters).toEqual({
      query: "",
      query_like_pattern: null,
      status: "all",
      limit: 100,
      near_unlock_threshold_percent: 80,
    });
  });

  it("trims query and builds escaped LIKE pattern", () => {
    const filters = buildRewardSearchFilters({ query: "  ana%  " });

    expect(filters.query).toBe("ana%");
    expect(filters.query_like_pattern).toBe("%ana\\%%");
  });

  it("falls back to all status when status is invalid", () => {
    const filters = buildRewardSearchFilters({
      status: "invalid" as never,
    });

    expect(filters.status).toBe("all");
  });

  it("clamps limit and threshold", () => {
    const filters = buildRewardSearchFilters({
      limit: -10,
      near_unlock_threshold_percent: 180,
    });

    expect(filters.limit).toBe(0);
    expect(filters.near_unlock_threshold_percent).toBe(99);
  });
});

describe("getRewardStatusLabel", () => {
  it("returns consistent human labels for reward states", () => {
    expect(getRewardStatusLabel("redeemed")).toBe("Canjeado");
    expect(getRewardStatusLabel("eligible")).toBe("Canjeable");
    expect(getRewardStatusLabel("near_unlock")).toBe("Cerca de premio");
    expect(getRewardStatusLabel("active")).toBe("Activo");
    expect(getRewardStatusLabel("inactive")).toBe("Sin actividad");
  });
});
