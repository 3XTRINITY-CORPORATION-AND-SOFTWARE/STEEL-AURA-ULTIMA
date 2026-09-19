/**
 * @steel-aura/steel-core — mix engine ≥10ch (U1 Mix / Steel Studio)
 */

export {
  DEFAULT_CHANNEL_IDS,
  type ChannelId,
  type ChannelState,
  type MasterBusState,
  type TransportState,
  type PlayAllResult,
  type MixSnapshot,
} from "./types.ts";

export {
  InMemorySimBackend,
  type AudioBackend,
  type OsAudioHost,
  type ScheduleNote,
} from "./audio-backend.ts";

export {
  MixEngine,
  MIN_CHANNELS,
  effectiveAudible,
  type MixEngineOptions,
} from "./mix-engine.ts";
