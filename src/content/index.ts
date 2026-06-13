import missionsRaw from './missions';
import assetsRaw from './assets';
import isotopeBodiesRaw from './isotope-bodies';
import magmaOceanRaw from './magma-ocean';
import moonSamplesRaw from './moon-samples';
import postcardsRaw from './postcards';
import surfaceFeaturesRaw from './surface-features';
import waterOriginsRaw from './water-origins';

import type { Mission, AssetCredit, IsotopeBody, MagmaOceanStep, MoonSample, PostcardData, SurfaceFeature, WaterOrigin } from '@/types/content';

export const assets: readonly AssetCredit[] = assetsRaw;
export const surfaceFeatures: readonly SurfaceFeature[] = surfaceFeaturesRaw;
export const isotopeBodies: readonly IsotopeBody[] = isotopeBodiesRaw;
export const magmaOcean: readonly MagmaOceanStep[] = magmaOceanRaw;
export const waterOrigins: readonly WaterOrigin[] = waterOriginsRaw;

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
