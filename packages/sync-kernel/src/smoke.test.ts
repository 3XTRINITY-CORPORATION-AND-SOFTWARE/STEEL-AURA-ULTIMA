import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PingClock } from './ping-clock.ts';
import { SyncBudget, SYNC_BUDGET_MS, withinBudget } from './sync-budget.ts';
import { CpuGovernor } from './cpu-governor.ts';

test('PingClock EWMA', () => {
  const c = new PingClock({ alpha: 0.5 });
  c.recordRtt(100); c.recordRtt(50);
  assert.equal(c.ewmaRttMs, 75);
});

test('SyncBudget ±200ms', () => {
  assert.equal(SYNC_BUDGET_MS, 200);
  assert.equal(new SyncBudget().measure(1000, 1100).withinBudget, true);
  assert.equal(withinBudget(250), false);
});

test('CpuGovernor', () => {
  assert.equal(new CpuGovernor().update(0.95).allowAudioDrop, true);
});
