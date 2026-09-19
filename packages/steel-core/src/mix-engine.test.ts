import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SYNC_BUDGET_MS,
  withinBudget,
  SyncPing,
} from "@steel-aura/sync-kernel";
import {
  MixEngine,
  MIN_CHANNELS,
  DEFAULT_CHANNEL_IDS,
  InMemorySimBackend,
  effectiveAudible,
} from "./index.ts";

function makeSync(skewMs: number): SyncPing {
  const ping = new SyncPing();
  ping.setSkewMs(skewMs);
  return ping;
}

describe("MixEngine ≥10 channels", () => {
  it("creates ≥10 named default channels", () => {
    const eng = new MixEngine();
    assert.ok(eng.channelCount >= MIN_CHANNELS);
    assert.equal(eng.channelCount, DEFAULT_CHANNEL_IDS.length);
    assert.deepEqual(eng.listChannelIds(), [...DEFAULT_CHANNEL_IDS]);
    for (const id of DEFAULT_CHANNEL_IDS) {
      assert.equal(eng.getChannel(id).id, id);
    }
  });

  it("rejects <10 channel configs", () => {
    assert.throws(
      () => new MixEngine({ channelIds: ["a", "b", "c"] }),
      /≥10/,
    );
  });

  it("arms all and playAllArmed starts simultaneous (≥10)", () => {
    const backend = new InMemorySimBackend();
    const eng = new MixEngine({ backend });
    eng.armAll();
    const result = eng.playAllArmed();
    assert.equal(result.ok, true);
    assert.equal(result.transport, "playing");
    assert.ok(result.started.length >= 10);
    assert.equal(result.started.length, eng.channelCount);
    const schedules = backend.log.filter((e) => e.type === "schedulePlay");
    assert.equal(schedules.length, 1);
    const notes = schedules[0].payload as Array<{
      channelId: string;
      startAtMs: number;
    }>;
    assert.ok(notes.length >= 10);
    const t0 = notes[0].startAtMs;
    assert.ok(notes.every((n) => n.startAtMs === t0));
    assert.equal(backend.playingIds().length, eng.channelCount);
  });

  it("mute / solo / gain / pan work", () => {
    const eng = new MixEngine();
    eng.setGain("kick", 0.5);
    eng.setMute("snare", true);
    eng.setSolo("bass", true);
    eng.setPan("pad", -0.5);
    assert.equal(eng.getChannel("kick").gain, 0.5);
    assert.equal(eng.getChannel("snare").mute, true);
    assert.equal(eng.getChannel("bass").solo, true);
    assert.equal(eng.getChannel("pad").pan, -0.5);

    const snap = eng.snapshot();
    const snare = snap.channels.find((c) => c.id === "snare")!;
    const bass = snap.channels.find((c) => c.id === "bass")!;
    const kick = snap.channels.find((c) => c.id === "kick")!;
    assert.equal(effectiveAudible(snap.channels, snare), false);
    assert.equal(effectiveAudible(snap.channels, bass), true);
    assert.equal(effectiveAudible(snap.channels, kick), false);
  });

  it("master bus mute silences scheduled gains", () => {
    const backend = new InMemorySimBackend();
    const eng = new MixEngine({ backend });
    eng.armAll();
    eng.setMasterMute(true);
    eng.playAllArmed();
    const notes = backend.log.find((e) => e.type === "schedulePlay")!
      .payload as Array<{ gain: number }>;
    assert.ok(notes.every((n) => n.gain === 0));
  });

  it("playSimultaneous legacy alias arms and plays", () => {
    const eng = new MixEngine();
    const r = eng.playSimultaneous();
    assert.equal(r.ok, true);
    assert.equal(eng.playingCount(), eng.channelCount);
  });
});

describe("MixEngine ↔ sync-kernel budget wire", () => {
  it("SYNC_BUDGET_MS is 200", () => {
    assert.equal(SYNC_BUDGET_MS, 200);
    assert.equal(withinBudget(200), true);
    assert.equal(withinBudget(201), false);
  });

  it("refuses playAllArmed when skew outside ±200ms", () => {
    const eng = new MixEngine({ sync: makeSync(300) });
    eng.armAll();
    const result = eng.playAllArmed();
    assert.equal(result.ok, false);
    assert.equal(result.transport, "refused");
    assert.equal(result.started.length, 0);
    assert.equal(result.skewMs, 300);
    assert.match(result.reason ?? "", /outside/);
  });

  it("schedules with compensation when skew within budget", () => {
    const backend = new InMemorySimBackend();
    backend.setClock(1000);
    const eng = new MixEngine({ backend, sync: makeSync(80) });
    eng.armAll();
    const result = eng.playAllArmed();
    assert.equal(result.ok, true);
    assert.ok(result.compensationMs !== null);
    assert.equal(result.skewMs, 80);
    const notes = backend.log.find((e) => e.type === "schedulePlay")!
      .payload as Array<{ startAtMs: number }>;
    assert.equal(notes[0].startAtMs, 1000 + (result.compensationMs ?? 0));
  });

  it("exposes measured skew", () => {
    const eng = new MixEngine({ sync: makeSync(12) });
    eng.armAll();
    eng.playAllArmed();
    assert.equal(eng.measuredSkewMs(), 12);
  });
});
