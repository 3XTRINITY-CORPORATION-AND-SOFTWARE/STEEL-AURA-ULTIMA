/**
 * OS-first audio host abstraction — InMemorySimBackend for CI (no hardware).
 */

import type { ChannelId, ChannelState, MasterBusState } from "./types.ts";

export type ScheduleNote = {
  channelId: ChannelId;
  startAtMs: number;
  gain: number;
  pan: number;
};

export interface AudioBackend {
  readonly name: string;
  nowMs(): number;
  schedulePlay(notes: ScheduleNote[]): void;
  stopAll(): void;
  applyChannel?(ch: ChannelState): void;
  applyMaster?(master: MasterBusState): void;
}

/** In-memory / sim backend — records schedule events for assertions. */
export class InMemorySimBackend implements AudioBackend {
  readonly name = "in-memory-sim";
  private clock = 0;
  readonly log: Array<{ type: string; at: number; payload?: unknown }> = [];
  private playing = new Set<ChannelId>();

  nowMs(): number {
    return this.clock;
  }

  advanceMs(delta: number): void {
    this.clock += delta;
  }

  setClock(ms: number): void {
    this.clock = ms;
  }

  schedulePlay(notes: ScheduleNote[]): void {
    this.log.push({ type: "schedulePlay", at: this.clock, payload: notes });
    for (const n of notes) this.playing.add(n.channelId);
  }

  stopAll(): void {
    this.log.push({ type: "stopAll", at: this.clock });
    this.playing.clear();
  }

  applyChannel(ch: ChannelState): void {
    this.log.push({ type: "applyChannel", at: this.clock, payload: ch });
  }

  applyMaster(master: MasterBusState): void {
    this.log.push({ type: "applyMaster", at: this.clock, payload: master });
  }

  isPlaying(id: ChannelId): boolean {
    return this.playing.has(id);
  }

  playingIds(): ChannelId[] {
    return [...this.playing];
  }

  clearLog(): void {
    this.log.length = 0;
  }
}

/** Alias for OS wiring docs. */
export type OsAudioHost = AudioBackend;
