/**
 * AURORA BOREALIS ULTIMA™ — entry that conceptually wires AURA journal + media bank.
 */
import type { FrequencyPatternJournal, FrequencyPatternJournalData } from '../../../packages/aura-viz/src/index.ts';
import type { MediaBank, MediaAsset, VideoMetadata } from '../../../packages/media-bank/src/index.ts';

export type UltimaInputs = {
  journal: FrequencyPatternJournal | FrequencyPatternJournalData;
  media?: MediaBank;
  videoAsset?: MediaAsset;
};

export type UltimaPlan = {
  hopCount: number;
  accuracyClass: '1000:1000';
  videoHint?: Pick<VideoMetadata, 'height' | 'fps' | 'format'>;
};

/** Build a generation plan from 1:1 frequency journal (+ optional media). */
export function planFromJournal(inputs: UltimaInputs): UltimaPlan {
  const data = 'toJSON' in inputs.journal && typeof inputs.journal.toJSON === 'function'
    ? inputs.journal.toJSON()
    : (inputs.journal as FrequencyPatternJournalData);

  const videoHint =
    inputs.videoAsset?.metadata.kind === 'video'
      ? {
          height: inputs.videoAsset.metadata.height,
          fps: inputs.videoAsset.metadata.fps,
          format: inputs.videoAsset.metadata.format,
        }
      : undefined;

  return {
    hopCount: data.header.hopCount,
    accuracyClass: '1000:1000',
    videoHint,
  };
}

export type { FrequencyPatternJournal, MediaBank, MediaAsset };
