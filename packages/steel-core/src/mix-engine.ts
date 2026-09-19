/**
 * MixEngine — ≥10 named channels, simultaneous play, OS-first, sync-budget gated.
 *
 * Sync: schedule against ±200ms from @steel-aura/sync-kernel (SYNC_BUDGET_MS).
 * OS host is master clock; web UI follows with PingClock compensation.
 */

import {
  SYNC_BUDGET_MS,
  withinBudget,
  compensationDelayMs,
  type SyncPing,
} from "@steel-aura/sync-kernel";
import {
  DEFAULT_CHANNEL_IDS,
  type ChannelId,
  type ChannelState,
  type MasterBusState,
  type MixSnapshot,
  type PlayAllResult,
  type TransportState,
} from "./types.ts";
import {
  InMemorySimBackend,
  type AudioBackend,
  type ScheduleNote,
} from "./audio-backend.ts";

/** Minimum channel capacity (Ultima contract). */
export const MIN_CHANNELS = 10;

export type MixEngineOptions = {
  channelIds?: readonly ChannelId[];
  /** Legacy numeric count — expanded to Ch N names if channelIds omitted. */
  channelCount?: number;
  backend?: AudioBackend;
  sync?: SyncPing | null;
  syncBudgetMs?: number;
  refuseOutsideBudget?: boolean;
  masterGain?: number;
};

function defaultChannel(id: ChannelId): ChannelState {
  return {
    id,
    gain: 1,
    mute: false,
    solo: false,
    pan: 0,
    armed: false,
    playing: false,
  };
}

function resolveChannelIds(opts: MixEngineOptions): ChannelId[] {
  if (opts.channelIds) return [...opts.channelIds];
  if (opts.channelCount != null) {
    const n = Math.max(MIN_CHANNELS, opts.channelCount);
    return Array.from({ length: n }, (_, i) => `Ch ${i + 1}`);
  }
  return [...DEFAULT_CHANNEL_IDS];
}

/** Effective audible under mute/solo rules. */
export function effectiveAudible(
  channels: ChannelState[],
  ch: ChannelState,
): boolean {
  if (ch.mute) return false;
  const anySolo = channels.some((c) => c.solo);
  if (anySolo && !ch.solo) return false;
  return true;
}

export class MixEngine {
  readonly channelCount: number;
  private readonly channels = new Map<ChannelId, ChannelState>();
  private master: MasterBusState;
  private transport: TransportState = "stopped";
  private readonly backend: AudioBackend;
  private sync: SyncPing | null;
  private readonly syncBudgetMs: number;
  private readonly refuseOutsideBudget: boolean;
  private lastSkewMs: number | null = null;

  constructor(opts: MixEngineOptions = {}) {
    const ids = resolveChannelIds(opts);
    if (ids.length < MIN_CHANNELS) {
      throw new RangeError(
        `MixEngine requires ≥${MIN_CHANNELS} channels (got ${ids.length}); see contracts/MIX.md`,
      );
    }
    for (const id of ids) {
      this.channels.set(id, defaultChannel(id));
    }
    this.channelCount = ids.length;
    this.master = { gain: opts.masterGain ?? 1, mute: false };
    this.backend = opts.backend ?? new InMemorySimBackend();
    this.sync = opts.sync ?? null;
    this.syncBudgetMs = opts.syncBudgetMs ?? SYNC_BUDGET_MS;
    this.refuseOutsideBudget = opts.refuseOutsideBudget ?? true;
  }

  getBackend(): AudioBackend {
    return this.backend;
  }

  setSync(sync: SyncPing | null): void {
    this.sync = sync;
  }

  listChannelIds(): ChannelId[] {
    return [...this.channels.keys()];
  }

  getChannels(): ChannelState[] {
    return [...this.channels.values()].map((c) => ({ ...c }));
  }

  getChannel(id: ChannelId | number): ChannelState {
    const key = typeof id === "number" ? this.indexToId(id) : id;
    const ch = this.channels.get(key);
    if (!ch) throw new Error(`unknown channel: ${String(id)}`);
    return { ...ch };
  }

  getMaster(): MasterBusState {
    return { ...this.master };
  }

  getMasterGain(): number {
    return this.master.gain;
  }

  getTransport(): TransportState {
    return this.transport;
  }

  isTransportPlaying(): boolean {
    return this.transport === "playing";
  }

  measuredSkewMs(): number | null {
    return this.lastSkewMs ?? this.sync?.measuredSkewMs() ?? null;
  }

  setGain(id: ChannelId | number, gain: number): void {
    const ch = this.must(id);
    ch.gain = clamp01(gain);
    this.backend.applyChannel?.(ch);
  }

  setMute(id: ChannelId | number, mute: boolean): void {
    const ch = this.must(id);
    ch.mute = mute;
    this.backend.applyChannel?.(ch);
  }

  setSolo(id: ChannelId | number, solo: boolean): void {
    const ch = this.must(id);
    ch.solo = solo;
    this.backend.applyChannel?.(ch);
  }

  setPan(id: ChannelId | number, pan: number): void {
    const ch = this.must(id);
    ch.pan = Math.max(-1, Math.min(1, pan));
    this.backend.applyChannel?.(ch);
  }

  setArmed(id: ChannelId | number, armed: boolean): void {
    this.must(id).armed = armed;
  }

  armAll(): void {
    for (const ch of this.channels.values()) ch.armed = true;
  }

  setMasterGain(gain: number): void {
    this.master.gain = clamp01(gain);
    this.backend.applyMaster?.(this.master);
  }

  setMasterMute(mute: boolean): void {
    this.master.mute = mute;
    this.backend.applyMaster?.(this.master);
  }

  /**
   * Start all armed channels on one timeline — no one-clip-only gate.
   * Sync: refuse when |skew| > ±200ms; else compensate.
   */
  playAllArmed(): PlayAllResult {
    const skewMs = this.readSkewMs();
    this.lastSkewMs = skewMs;

    if (
      skewMs !== null &&
      this.refuseOutsideBudget &&
      !withinBudget(skewMs, this.syncBudgetMs)
    ) {
      this.transport = "refused";
      return {
        ok: false,
        transport: "refused",
        started: [],
        skewMs,
        compensationMs: null,
        reason: `sync skew ${skewMs}ms outside ±${this.syncBudgetMs}ms budget`,
      };
    }

    const compensation =
      skewMs !== null ? compensationDelayMs(skewMs, this.syncBudgetMs) : 0;
    const delayMs = compensation ?? 0;
    const startAt = this.backend.nowMs() + delayMs;

    const all = [...this.channels.values()];
    const notes: ScheduleNote[] = [];
    const started: ChannelId[] = [];

    for (const ch of all) {
      if (!ch.armed) continue;
      const audible =
        !this.master.mute && effectiveAudible(all, ch) && ch.gain > 0;
      const noteGain = audible ? ch.gain * this.master.gain : 0;
      notes.push({
        channelId: ch.id,
        startAtMs: startAt,
        gain: noteGain,
        pan: ch.pan,
      });
      ch.playing = true;
      started.push(ch.id);
    }

    this.backend.schedulePlay(notes);
    this.transport = "playing";
    return {
      ok: true,
      transport: "playing",
      started,
      skewMs,
      compensationMs: delayMs,
    };
  }

  /**
   * Legacy alias — simultaneous play of given (or all) channels.
   * Arms requested channels then playAllArmed().
   */
  playSimultaneous(
    channelIds?: Array<ChannelId | number>,
  ): { ok: boolean; reason?: string; compensationMs: number | null } {
    if (channelIds) {
      for (const ch of this.channels.values()) ch.armed = false;
      for (const id of channelIds) this.setArmed(id, true);
    } else {
      this.armAll();
    }
    const result = this.playAllArmed();
    return {
      ok: result.ok,
      reason: result.reason,
      compensationMs: result.compensationMs,
    };
  }

  stopAll(): void {
    this.backend.stopAll();
    for (const ch of this.channels.values()) ch.playing = false;
    this.transport = "stopped";
  }

  effectiveGain(id: ChannelId | number): number {
    const ch = this.must(id);
    if (this.master.mute) return 0;
    if (!effectiveAudible([...this.channels.values()], ch)) return 0;
    return ch.gain * this.master.gain;
  }

  playingCount(): number {
    return [...this.channels.values()].filter((c) => c.playing).length;
  }

  snapshot(): MixSnapshot {
    return {
      channels: this.getChannels(),
      master: { ...this.master },
      transport: this.transport,
      channelCount: this.channelCount,
    };
  }

  private readSkewMs(): number | null {
    if (!this.sync) return null;
    return this.sync.measuredSkewMs();
  }

  private indexToId(index: number): ChannelId {
    const ids = this.listChannelIds();
    const id = ids[index];
    if (id === undefined) throw new Error(`channel ${index} out of range`);
    return id;
  }

  private must(id: ChannelId | number): ChannelState {
    const key = typeof id === "number" ? this.indexToId(id) : id;
    const ch = this.channels.get(key);
    if (!ch) throw new Error(`unknown channel: ${String(id)}`);
    return ch;
  }
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
