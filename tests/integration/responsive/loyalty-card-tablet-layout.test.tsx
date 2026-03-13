/**
 * Responsive loyalty-card tablet-layout tests.
 *
 * Verifies that loyalty card sub-components use rounded section cards
 * with responsive padding, readable font sizes, and a max-width
 * container – all appropriate for a tablet-first customer-facing view.
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoyaltyCardHeader } from "@/components/loyalty-card/loyalty-card-header";
import { LoyaltyProgressBar } from "@/components/loyalty-card/loyalty-progress-bar";
import { LoyaltyRewardStatus } from "@/components/loyalty-card/loyalty-reward-status";

// ---------------------------------------------------------------------------
// LoyaltyCardHeader
// ---------------------------------------------------------------------------

describe("LoyaltyCardHeader – tablet layout", () => {
  it("renders with rounded-3xl section for soft tablet appearance", () => {
    const { container } = render(
      <LoyaltyCardHeader
        businessName="Café Delicia"
        customerName="Ana García"
        maskedPhone="***-***-1234"
      />,
    );

    const header = container.querySelector("header");
    expect(header?.className).toContain("rounded-3xl");
  });

  it("uses sm:p-4 responsive padding to keep the card compact on tablet", () => {
    const { container } = render(
      <LoyaltyCardHeader
        businessName="Café Delicia"
        customerName="Ana García"
        maskedPhone="***-***-1234"
      />,
    );

    const header = container.querySelector("header");
    expect(header?.className).toContain("sm:p-4");
  });

  it("renders business name at text-lg for legibility on tablet", () => {
    render(
      <LoyaltyCardHeader
        businessName="Café Delicia"
        customerName="Ana García"
        maskedPhone="***-***-1234"
      />,
    );

    // Business name is the text-lg element
    const businessEl = screen.getByText("Café Delicia");
    expect(businessEl.className).toContain("text-lg");
  });

  it("renders customer name at an accessible size", () => {
    render(
      <LoyaltyCardHeader
        businessName="Café Delicia"
        customerName="Ana García"
        maskedPhone="***-***-1234"
      />,
    );

    const nameEl = screen.getByText("Ana García");
    expect(nameEl.className).toContain("text-base");
  });
});

// ---------------------------------------------------------------------------
// LoyaltyProgressBar
// ---------------------------------------------------------------------------

describe("LoyaltyProgressBar – tablet layout", () => {
  it("renders with rounded-3xl section container", () => {
    const { container } = render(
      <LoyaltyProgressBar
        currentPoints={80}
        targetPoints={100}
        progressPercentage={80}
        remainingPoints={20}
      />,
    );

    const section = container.querySelector("section");
    expect(section?.className).toContain("rounded-3xl");
  });

  it("point total is displayed at text-4xl for at-a-glance reading on tablet", () => {
    render(
      <LoyaltyProgressBar
        currentPoints={80}
        targetPoints={100}
        progressPercentage={80}
        remainingPoints={20}
      />,
    );

    // The large points display
    const ptsEl = screen.getByText("80");
    expect(ptsEl.className).toContain("text-4xl");
  });

  it("progress bar has role=progressbar with correct aria attributes", () => {
    render(
      <LoyaltyProgressBar
        currentPoints={60}
        targetPoints={100}
        progressPercentage={60}
        remainingPoints={40}
      />,
    );

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "60");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });
});

// ---------------------------------------------------------------------------
// LoyaltyRewardStatus
// ---------------------------------------------------------------------------

describe("LoyaltyRewardStatus – tablet layout", () => {
  it("redeemable status section uses rounded-3xl and sm:p-4", () => {
    const { container } = render(
      <LoyaltyRewardStatus
        status="redeemable"
        redeemableRewardName="Café gratis"
        remainingPoints={0}
      />,
    );

    const section = container.querySelector("section");
    expect(section?.className).toContain("rounded-3xl");
    expect(section?.className).toContain("sm:p-4");
  });

  it("in_progress status section uses rounded-3xl and sm:p-4", () => {
    const { container } = render(
      <LoyaltyRewardStatus
        status="in_progress"
        nextRewardName="Postre gratis"
        remainingPoints={25}
      />,
    );

    const section = container.querySelector("section");
    expect(section?.className).toContain("rounded-3xl");
    expect(section?.className).toContain("sm:p-4");
  });

  it("reward heading is rendered at text-xl for stronger hierarchy", () => {
    render(
      <LoyaltyRewardStatus
        status="redeemable"
        redeemableRewardName="Café gratis"
        remainingPoints={0}
      />,
    );

    const statusHeading = screen.getByText("Reward unlocked");
    expect(statusHeading.className).toContain("text-xl");
  });
});
