export type {
  SyncPingV1,
  SyncMode,
  SyncBudgetConfig,
  BudgetCheck,
} from './types.ts';
export {
  DEFAULT_BUDGET,
  DEFAULT_FRAME_MS,
  FRAME_MS_60FPS,
} from './types.ts';

export { SyncClock } from './clock.ts';
export type { SyncClockSnapshot, SyncClockOptions } from './clock.ts';

export {
  PING_INTERVAL_MS,
  normalizeSkew,
  checkBudget,
  computeSkewMs,
  measurePing,
  createPingLoop,
} from './ping.ts';
export type {
  MeasurePingOptions,
  PingResult,
  PingLoop,
  PingLoopHandlers,
  CreatePingLoopOptions,
} from './ping.ts';

export { recommendMode } from './governor.ts';
export type { GovernorInput } from './governor.ts';

export { PingClock, type PingSample, type PingClockOptions } from './ping-clock.ts';
export {
  SyncBudget,
  SYNC_BUDGET_MS,
  SYNC_BUDGET_SECONDS,
  withinBudget,
  compensationDelayMs,
  type SkewMeasurement,
} from './sync-budget.ts';
export {
  CpuGovernor,
  type CpuGovernorOptions,
  type GovernorState,
  type GovernorTier,
} from './cpu-governor.ts';
export { PingClock as SyncPing } from './ping-clock.ts';
