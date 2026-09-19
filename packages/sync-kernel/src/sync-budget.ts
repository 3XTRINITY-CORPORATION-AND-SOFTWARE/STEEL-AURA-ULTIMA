/** SyncBudget — ±0.2s (200ms) hard ceiling. */
export const SYNC_BUDGET_SECONDS = 0.2;
export const SYNC_BUDGET_MS = 200;

export type SkewMeasurement = { skewMs: number; measuredAt: number; withinBudget: boolean };

export class SyncBudget {
  readonly limitMs: number;
  constructor(limitMs: number = SYNC_BUDGET_MS) { this.limitMs = limitMs; }

  measure(uiClockMs: number, kernelClockMs: number, at: number = Date.now()): SkewMeasurement {
    const skewMs = uiClockMs - kernelClockMs;
    return { skewMs, measuredAt: at, withinBudget: Math.abs(skewMs) <= this.limitMs };
  }

  clampOffsetMs(offsetMs: number): number {
    return Math.max(-this.limitMs, Math.min(this.limitMs, offsetMs));
  }

  isOverBudget(skewMs: number): boolean { return Math.abs(skewMs) > this.limitMs; }
}

export function withinBudget(skewMs: number, limitMs: number = SYNC_BUDGET_MS): boolean {
  return Math.abs(skewMs) <= limitMs;
}

export function compensationDelayMs(skewMs: number, budgetMs: number = SYNC_BUDGET_MS): number | null {
  if (Math.abs(skewMs) > budgetMs) return null;
  return -skewMs / 2;
}
