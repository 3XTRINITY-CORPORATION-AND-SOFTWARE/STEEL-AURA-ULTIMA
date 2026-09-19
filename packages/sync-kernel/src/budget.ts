/**
 * Sync budget helpers — abs(normalizedSkew) ≤ 0.2
 */

import {
  DEFAULT_BUDGET,
  DEFAULT_FRAME_MS,
  type BudgetCheck,
  type SyncBudgetConfig,
} from "./types.ts";

export { DEFAULT_FRAME_MS, FRAME_MS_60FPS } from "./types.ts";

/**
 * Normalize skew against frameMs.
 * Default frameMs=1000 ⇒ budget |skewMs| ≤ 200ms (±0.2).
 * Use FRAME_MS_60FPS (~16.67) for sub-frame budgets.
 */
export function normalizeSkew(skewMs: number, frameMs: number = DEFAULT_FRAME_MS): number {
  if (frameMs <= 0) throw new Error("frameMs must be > 0");
  return skewMs / frameMs;
}

export function checkBudget(
  skewMs: number,
  budget: SyncBudgetConfig = DEFAULT_BUDGET,
): BudgetCheck {
  const cfg = { ...DEFAULT_BUDGET, ...budget };
  const normalizedSkew = normalizeSkew(skewMs, cfg.frameMs);
  const withinBudget = Math.abs(normalizedSkew) <= cfg.maxNormalizedSkew;
  return {
    skewMs,
    normalizedSkew,
    withinBudget,
    mode: withinBudget ? "aligned" : "safe_viz",
  };
}

/**
 * Skew after RTT/2 one-way estimate:
 *   oneWayMs = rttMs / 2
 *   skewMs   = tKernel - (tClient + oneWayMs)
 */
export function computeSkewMs(tClient: number, tKernel: number, rttMs: number): number {
  const oneWayMs = rttMs / 2;
  return tKernel - (tClient + oneWayMs);
}
