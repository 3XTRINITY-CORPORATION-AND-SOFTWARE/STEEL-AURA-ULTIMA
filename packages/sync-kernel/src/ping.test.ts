import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  checkBudget,
  computeSkewMs,
  measurePing,
  normalizeSkew,
  recommendMode,
  DEFAULT_FRAME_MS,
  FRAME_MS_60FPS,
  SyncClock,
} from "./index.ts";

describe("sync-kernel budget ±0.2", () => {
  it("normalizeSkew uses frameMs=1000 by default (±200ms ceiling)", () => {
    assert.equal(normalizeSkew(200), 0.2);
    assert.equal(normalizeSkew(-200), -0.2);
    assert.equal(normalizeSkew(0), 0);
  });

  it("exports 60fps frame helper (~16.67ms)", () => {
    assert.ok(Math.abs(FRAME_MS_60FPS - 1000 / 60) < 1e-12);
    const n = normalizeSkew((1000 / 60) * 0.2, FRAME_MS_60FPS);
    assert.ok(Math.abs(n - 0.2) < 1e-12);
  });

  it("within-budget skew → aligned", () => {
    const check = checkBudget(100); // 100ms / 1000 = 0.1 ≤ 0.2
    assert.equal(check.withinBudget, true);
    assert.equal(check.mode, "aligned");
    assert.equal(check.normalizedSkew, 0.1);
  });

  it("breach |normalizedSkew| > 0.2 → safe_viz", () => {
    const check = checkBudget(250); // 0.25 > 0.2
    assert.equal(check.withinBudget, false);
    assert.equal(check.mode, "safe_viz");
  });

  it("boundary ±200ms is within budget", () => {
    assert.equal(checkBudget(200).withinBudget, true);
    assert.equal(checkBudget(-200).withinBudget, true);
    assert.equal(checkBudget(200.1).withinBudget, false);
  });

  it("computeSkewMs applies RTT/2 one-way estimate", () => {
    // tClient=1000, tKernel=1100, rtt=20 → oneWay=10 → skew=1100-(1000+10)=90
    assert.equal(computeSkewMs(1000, 1100, 20), 90);
  });

  it("measurePing in-process stays within budget under nominal clocks", () => {
    const clock = new SyncClock();
    const result = measurePing({ clock, cpuLoad: 0.1, glitchScore: 0 });
    assert.ok(Math.abs(result.ping.skewMs) < DEFAULT_FRAME_MS * 0.2);
    assert.equal(result.mode, "aligned");
    assert.equal(typeof result.ping.tClient, "number");
    assert.equal(typeof result.ping.tKernel, "number");
    assert.ok(result.ping.cpuLoad >= 0 && result.ping.cpuLoad <= 1);
  });

  it("injected kernel skew breach → safe_viz", () => {
    const clock = new SyncClock();
    const tClientApprox = clock.wallNow();
    // Force kernel ~500ms ahead with negligible RTT → normalized ~0.5
    const result = measurePing({
      clock,
      tKernel: tClientApprox + 500,
      cpuLoad: 0,
      glitchScore: 0,
    });
    assert.ok(Math.abs(result.check.normalizedSkew) > 0.2);
    assert.equal(result.mode, "safe_viz");
  });

  it("governor: high cpuLoad → safe_viz even if skew ok", () => {
    assert.equal(recommendMode({ skewMs: 0, cpuLoad: 0.9, glitchScore: 0 }), "safe_viz");
  });

  it("governor: high glitchScore → safe_viz", () => {
    assert.equal(recommendMode({ skewMs: 0, cpuLoad: 0.1, glitchScore: 0.6 }), "safe_viz");
  });

  it("governor: nominal → aligned", () => {
    assert.equal(recommendMode({ skewMs: 50, cpuLoad: 0.2, glitchScore: 0.1 }), "aligned");
  });

  it("SyncClock ticks advance with monotonic now", () => {
    const clock = new SyncClock({ tickMs: 1 });
    const t0 = clock.ticks();
    const snap = clock.snapshot();
    assert.ok(snap.monoMs >= 0);
    assert.ok(snap.wallMs > 0);
    assert.ok(clock.uptime() >= 0);
    assert.ok(clock.ticks() >= t0);
  });
});
