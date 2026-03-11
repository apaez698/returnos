import { rewardProgress } from "@/lib/points";

describe("rewardProgress", () => {
  it("calculates percentage progress", () => {
    expect(rewardProgress(3, 10)).toBe(30);
  });

  it("caps progress at 100", () => {
    expect(rewardProgress(14, 10)).toBe(100);
  });
});
