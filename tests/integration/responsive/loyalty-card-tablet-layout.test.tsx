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
import { LoyaltyCardPointsHero } from "@/components/loyalty-card/loyalty-card-points-hero";
import { LoyaltyCardProgressSection } from "@/components/loyalty-card/loyalty-card-progress-section";
import { LoyaltyCardStatusMessage } from "@/components/loyalty-card/loyalty-card-status-message";

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

  it("uses sm:p-5 responsive padding to preserve touch comfort on tablet", () => {
    const { container } = render(
      <LoyaltyCardHeader
        businessName="Café Delicia"
        customerName="Ana García"
        maskedPhone="***-***-1234"
      />,
    );

    const header = container.querySelector("header");
    expect(header?.className).toContain("sm:p-5");
  });

  it("renders business name at text-xl for stronger branding hierarchy", () => {
    render(
      <LoyaltyCardHeader
        businessName="Café Delicia"
        customerName="Ana García"
        maskedPhone="***-***-1234"
      />,
    );

    // Business name is now larger to make branding more prominent.
    const businessEl = screen.getByText("Café Delicia");
    expect(businessEl.className).toContain("text-xl");
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
// LoyaltyCardPointsHero
// ---------------------------------------------------------------------------

describe("LoyaltyCardPointsHero – tablet layout", () => {
  it("renders with rounded-3xl section container", () => {
    const { container } = render(<LoyaltyCardPointsHero currentPoints={80} />);

    const section = container.querySelector("section");
    expect(section?.className).toContain("rounded-3xl");
  });

  it("point total is displayed as the visual hero", () => {
    render(<LoyaltyCardPointsHero currentPoints={80} />);

    const ptsEl = screen.getByText("80");
    expect(ptsEl.className).toContain("text-5xl");
    expect(ptsEl.className).toContain("md:text-7xl");
  });
});

// ---------------------------------------------------------------------------
// LoyaltyCardProgressSection
// ---------------------------------------------------------------------------

describe("LoyaltyCardProgressSection – tablet layout", () => {
  it("progress bar has role=progressbar with correct aria attributes", () => {
    render(
      <LoyaltyCardProgressSection
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

  it("renders current vs target and remaining points for quick understanding", () => {
    render(
      <LoyaltyCardProgressSection
        currentPoints={60}
        targetPoints={100}
        progressPercentage={60}
        remainingPoints={40}
      />,
    );

    expect(screen.getByText("60 / 100 puntos")).toBeInTheDocument();
    expect(screen.getByText("40 puntos restantes")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// LoyaltyCardStatusMessage
// ---------------------------------------------------------------------------

describe("LoyaltyCardStatusMessage – tablet layout", () => {
  it("redeemable status section uses rounded-3xl and sm:p-5", () => {
    const { container } = render(
      <LoyaltyCardStatusMessage
        status="redeemable"
        redeemableRewardName="Café gratis"
        remainingPoints={0}
      />,
    );

    const section = container.querySelector("section");
    expect(section?.className).toContain("rounded-3xl");
    expect(section?.className).toContain("sm:p-5");
  });

  it("in_progress status section uses rounded-3xl and sm:p-5", () => {
    const { container } = render(
      <LoyaltyCardStatusMessage
        status="in_progress"
        nextRewardName="Postre gratis"
        remainingPoints={25}
      />,
    );

    const section = container.querySelector("section");
    expect(section?.className).toContain("rounded-3xl");
    expect(section?.className).toContain("sm:p-5");
  });

  it("shows a human-readable unlock message in redeemable state", () => {
    render(
      <LoyaltyCardStatusMessage
        status="redeemable"
        redeemableRewardName="Café gratis"
        remainingPoints={0}
      />,
    );

    expect(
      screen.getByText(
        "¡Desbloqueaste Café gratis! Muestra esta tarjeta en caja para canjearlo.",
      ),
    ).toBeInTheDocument();
  });
});
