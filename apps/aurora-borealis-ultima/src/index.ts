/**
 * AURORA BOREALIS ULTIMA™ — entry that conceptually wires AURA journal + media bank.
 */
import type { FrequencyPatternJournal, FrequencyPatternJournalDocument } from '../../../packages/aura-viz/src/index.ts';
import type { MediaBank, MediaAsset, VideoMetadata } from '../../../packages/media-bank/src/index.ts';

export type UltimaInputs = {
  journal: FrequencyPatternJournal | FrequencyPatternJournalDocument;
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
  const doc = 'toDocument' in inputs.journal ? inputs.journal.toDocument() : inputs.journal;

  const videoHint =
    inputs.videoAsset?.metadata.kind === 'video'
      ? {
          height: inputs.videoAsset.metadata.height,
          fps: inputs.videoAsset.metadata.fps,
          format: inputs.videoAsset.metadata.format,
        }
      : undefined;

  return {
    hopCount: doc.entries.length,
    accuracyClass: '1000:1000',
    videoHint,
  };
}

export type { FrequencyPatternJournal, MediaBank, MediaAsset };
