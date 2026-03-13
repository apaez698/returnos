/**
 * Touch-target utilities for bakery / cafeteria tablet POS and loyalty flows.
 *
 * Minimum interactive element height follows iOS HIG (44 pt) and
 * WCAG 2.5.5 AAA (44 × 44 px). Primary CTAs use 52 px for counter-top ease of use.
 *
 * Usage: import constants and spread them as className values, or compose with
 * additional modifier classes via template literals.
 */

/** Primary action button – full width, highly visible. */
export const touchPrimary = [
  "flex w-full min-h-[52px] items-center justify-center",
  "rounded-xl bg-slate-900 px-4 py-3",
  "text-base font-semibold text-white",
  "transition hover:bg-slate-800 active:scale-[0.98]",
  "disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

/** Secondary / outline button. */
export const touchSecondary = [
  "flex min-h-[44px] items-center justify-center",
  "rounded-xl border border-slate-300 bg-white px-4 py-2.5",
  "text-sm font-medium text-slate-800",
  "transition hover:bg-slate-50 active:bg-slate-100",
].join(" ");

/** Customer / selectable list row. */
export const touchListRow = [
  "flex w-full min-h-[52px] items-center",
  "rounded-xl border px-4 py-3 text-left",
  "transition-colors",
].join(" ");

/** Quick-amount chip button used in POS purchase form. */
export const touchQuickAmount = [
  "flex min-h-[44px] items-center justify-center",
  "rounded-xl border px-2 py-2",
  "text-base font-bold",
  "transition",
  "disabled:cursor-not-allowed disabled:opacity-40",
].join(" ");

/** Standard text input sized for comfortable touch interaction. */
export const touchInput = [
  "w-full rounded-xl border border-slate-300 bg-white",
  "px-4 py-3 text-base text-slate-900 placeholder:text-slate-400",
  "outline-none ring-indigo-500 focus:ring-2",
  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
].join(" ");

/**
 * Modal primary action button – full width, taller than the standard primary
 * for prominent tablet-first CTAs inside confirmation dialogs (min 56 px).
 */
export const touchModalPrimary = [
  "flex w-full min-h-[56px] items-center justify-center",
  "rounded-xl bg-slate-900 px-4 py-3.5",
  "text-base font-semibold text-white",
  "transition hover:bg-slate-800 active:scale-[0.98]",
  "disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

/**
 * Modal secondary button – full width outline variant, paired with
 * touchModalPrimary for the actions footer of a confirmation dialog.
 */
export const touchModalSecondary = [
  "flex w-full min-h-[48px] items-center justify-center",
  "rounded-xl border border-slate-300 bg-white px-4 py-3",
  "text-sm font-medium text-slate-800",
  "transition hover:bg-slate-50 active:bg-slate-100",
].join(" ");
