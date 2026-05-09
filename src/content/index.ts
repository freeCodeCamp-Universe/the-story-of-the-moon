import missionsRaw from './missions.json';
import assetsRaw from './assets.json';
import moonSamplesRaw from './moon-samples.json';
import postcardsRaw from './postcards.json';
import surfaceFeaturesRaw from './surface-features.json';

import type { Mission, AssetCredit, MoonSample, PostcardData, SurfaceFeature } from '@/types/content';

export const assets: AssetCredit[] = assetsRaw as AssetCredit[];
export const surfaceFeatures: SurfaceFeature[] = surfaceFeaturesRaw as SurfaceFeature[];

// Enrich missions, moonSamples, and postcards by merging alt from assets.json
// so that alt is available alongside src — assets.json remains the single source of truth.
export const missions: Mission[] = (missionsRaw as Array<Omit<Mission, 'photo'> & { photo: Omit<Mission['photo'], 'alt'> }>).map((m) => ({
  ...m,
  photo: { ...m.photo, alt: assets.find((a) => a.id === m.photo.creditId)?.alt ?? '' },
}));

export const moonSamples: MoonSample[] = (moonSamplesRaw as Array<Omit<MoonSample, 'alt'>>).map((s) => ({
  ...s,
  alt: assets.find((a) => a.id === s.creditId)?.alt ?? '',
}));

export const postcards: PostcardData[] = (postcardsRaw as Array<Omit<PostcardData, 'image'> & { image: Omit<PostcardData['image'], 'alt'> }>).map((p) => ({
  ...p,
  image: { ...p.image, alt: assets.find((a) => a.id === p.image.creditId)?.alt ?? '' },
}));

export function getAsset(id: string): AssetCredit | undefined {
  return assets.find((a) => a.id === id);
}
