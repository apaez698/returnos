/**
 * Responsive layout utilities for tablet-first flows (POS, loyalty card, lookup).
 *
 * Breakpoints mirror Tailwind defaults:
 *   - Tablet portrait  : md  (≥ 768 px)
 *   - Tablet landscape : lg  (≥ 1024 px)
 *   - Desktop          : xl  (≥ 1280 px)
 */

/** Full-width container, centered and capped at desktop widths. */
export const layoutContainer = "mx-auto w-full max-w-5xl";

/**
 * Two-column grid that splits at tablet portrait (md ≥ 768 px).
 * Single column on mobile, two equal columns on tablet and above.
 */
export const twoColTabletGrid = "grid grid-cols-1 gap-6 md:grid-cols-2";

/** Section card with responsive padding – compact on mobile, generous on tablet. */
export const sectionCard =
  "rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6";

/**
 * Native <dialog> modal panel – centered, full-width on mobile, capped at a
 * tablet-friendly max-width. Pair with showModal() to activate the backdrop.
 *
 * backdrop:* variants target the CSS ::backdrop pseudo-element rendered by
 * the browser when the dialog is opened as a modal (showModal()).
 */
export const modalPanel =
  "m-auto w-full max-w-lg rounded-2xl border-0 p-0 shadow-2xl " +
  "backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm";
