/**
 * Anti-glitch CPU governor — degrade viz before audio glitch.
 * On budget breach or soft load/glitch limits → safe_viz; kernel stays audio SoT.
 */

import {
  DEFAULT_BUDGET,
  type SyncBudgetConfig,
  type SyncMode,
} from "./types.ts";
import { checkBudget } from "./budget.ts";

export type GovernorInput = {
  skewMs: number;
  cpuLoad: number;
  glitchScore: number;
  budget?: Partial<SyncBudgetConfig>;
};

/**
 * Recommend SyncMode from skew + load + glitch.
 * Priority: skew budget breach → safe_viz; else soft CPU/glitch → safe_viz; else aligned.
 */
export function recommendMode(input: GovernorInput): SyncMode {
  const budget: SyncBudgetConfig = { ...DEFAULT_BUDGET, ...input.budget };
  const skewCheck = checkBudget(input.skewMs, budget);
  if (!skewCheck.withinBudget) return "safe_viz";

  const cpu = clamp01(input.cpuLoad);
  const glitch = clamp01(input.glitchScore);
  if (cpu >= budget.cpuSoftLimit) return "safe_viz";
  if (glitch >= budget.glitchSoftLimit) return "safe_viz";
  return "aligned";
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
