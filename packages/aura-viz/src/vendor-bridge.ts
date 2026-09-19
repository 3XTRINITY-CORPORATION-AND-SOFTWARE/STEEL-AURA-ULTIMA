/** Bridge to vendor/smaller-aura-src types. */
export type { AuraMode } from './frequency-pattern-journal.ts';
export const AURA_MODES = ['bars', 'ring', 'wave', 'bloom'] as const;
export type VendorTrackSlot = 'A' | 'B' | 'C';
export type VendorTrackState = {
  slot: VendorTrackSlot; name: string; kind: 'empty' | 'audio' | 'video' | 'other'; objectUrl?: string;
};
export const VENDOR_SMALLER_AURA_SRC = 'packages/aura-viz/vendor/smaller-aura-src' as const;
