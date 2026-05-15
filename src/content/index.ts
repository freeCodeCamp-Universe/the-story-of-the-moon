import missionsRaw from './missions';
import assetsRaw from './assets';
import moonSamplesRaw from './moon-samples';
import postcardsRaw from './postcards';
import surfaceFeaturesRaw from './surface-features';

import type { Mission, AssetCredit, MoonSample, PostcardData, SurfaceFeature } from '@/types/content';

export const assets: readonly AssetCredit[] = assetsRaw;
export const surfaceFeatures: readonly SurfaceFeature[] = surfaceFeaturesRaw;

// Enrich missions, moonSamples, and postcards by merging alt from the asset catalog
// so that alt is available alongside src while asset metadata stays centralized.
export const missions: Mission[] = missionsRaw.map((m) => ({
  ...m,
  photo: { ...m.photo, alt: assets.find((a) => a.id === m.photo.creditId)?.alt ?? '' },
}));

export const moonSamples: MoonSample[] = moonSamplesRaw.map((s) => ({
  ...s,
  alt: assets.find((a) => a.id === s.creditId)?.alt ?? '',
}));

export const postcards: PostcardData[] = postcardsRaw.map((p) => ({
  ...p,
  image: { ...p.image, alt: assets.find((a) => a.id === p.image.creditId)?.alt ?? '' },
}));

export function getAsset(id: string): AssetCredit | undefined {
  return assets.find((a) => a.id === id);
}
