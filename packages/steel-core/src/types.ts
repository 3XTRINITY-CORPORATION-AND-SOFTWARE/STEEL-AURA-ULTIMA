/**
 * Mix channel types — contracts/MIX.md (≥10 named channels)
 */

/** Named channel IDs — extends legacy 6ch (kick…vocal) to ≥10. */
export const DEFAULT_CHANNEL_IDS = [
  "kick",
  "snare",
  "hat",
  "bass",
  "pad",
  "lead",
  "fx",
  "vocal",
  "busA",
  "busB",
] as const;

export type ChannelId = (typeof DEFAULT_CHANNEL_IDS)[number] | (string & {});

export type ChannelState = {
  id: ChannelId;
  gain: number;
  mute: boolean;
  solo: boolean;
  pan: number;
  armed: boolean;
  playing: boolean;
};

export type MasterBusState = {
  gain: number;
  mute: boolean;
};

export type TransportState = "stopped" | "playing" | "refused";

export type PlayAllResult = {
  ok: boolean;
  transport: TransportState;
  started: ChannelId[];
  skewMs: number | null;
  compensationMs: number | null;
  reason?: string;
};

export type MixSnapshot = {
  channels: ChannelState[];
  master: MasterBusState;
  transport: TransportState;
  channelCount: number;
};
