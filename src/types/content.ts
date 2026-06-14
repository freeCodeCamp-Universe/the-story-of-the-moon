export type AssetCredit = {
  id: string;
  file: string;
  /** Accessible description of the image, used as the img alt attribute. */
  alt: string;
  source: string;
  /** NASA image-detail page (or equivalent). Human-readable landing page. */
  sourceUrl: string;
  /** Direct URL of the image file we downloaded from, preserved so the file can be re-fetched if the local copy is lost. */
  originalImageUrl?: string;
  author: string;
  license: string;
  licenseUrl: string;
  attributionText: string;
};

export type SurfaceFeature = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** Approximate diameter in kilometers; used to size the annotation ring. */
  diameterKm: number;
  description: string[];
};

export type CreditBackedImage<CreditId extends string = string> = {
  src: string;
  alt: string;
  creditId: CreditId;
};

export type CreditBackedImageSource<CreditId extends string = string> = Omit<CreditBackedImage<CreditId>, 'alt'>;

export type Mission<CreditId extends string = string> = {
  key: string;
  label: string;
  date: string;
  splashdownDate: string;
  crew: string[];
  oneLiner: string;
  prose: string[];
  photo: CreditBackedImage<CreditId>;
};

export type GapEntry = {
  type: 'gap';
  prose: string;
  photo: CreditBackedImage;
};

export type MissionEntry = Mission | GapEntry;

export type MissionSource<CreditId extends string = string> = Omit<Mission<CreditId>, 'photo'> & {
  photo: CreditBackedImageSource<CreditId>;
};

export type MoonSample<CreditId extends string = string> = {
  id: string;
  mission: string;
  sampleNumber: string;
  rockType: string;
  marker: string;
  properties: string;
  detail: string;
  alt: string;
  creditId: CreditId;
};

export type MoonSampleSource<CreditId extends string = string> = Omit<MoonSample<CreditId>, 'alt'>;

export type IsotopeBody = {
  id: string;
  name: string;
  /** Δ17O in per mil; sets the body's own fractionation line (vertical offset from Earth's). */
  delta17O: number;
  /** Display string for Δ17O shown in the info card, e.g. "≈ 0", "≡ 0", "+0.30". */
  valueLabel: string;
  /** One ESL-friendly sentence shown in the info card: where the rocks come from and why they matter. No SNC/HED jargon, no chart narration. */
  detail: string;
};

export type MagmaOceanStep = {
  id: string;
  /** Mono marker label shown above the controls and in the static legend, e.g. "Step 2 — Olivine sinks". */
  marker: string;
  /** One ESL-friendly sentence describing what happens at this step. Depths are labeled "approximate". */
  caption: string;
};

export type WaterOrigin = {
  id: string;
  /** Short suspect name shown as the prose subheading, e.g. "Solar wind". */
  name: string;
  /** One ESL-friendly paragraph: the claim, the support for it, and the doubt against it. */
  prose: string;
};

export type PostcardPlacementAfter = 'ch1' | 'ch2' | 'ch3' | 'ch5';

export type PostcardData<CreditId extends string = string> = {
  id: string;
  placement: { after: PostcardPlacementAfter };
  image: CreditBackedImage<CreditId>;
  caption: string;
};

export type PostcardSource<CreditId extends string = string> = Omit<PostcardData<CreditId>, 'image'> & {
  image: CreditBackedImageSource<CreditId>;
};

export type ChapterMeta = {
  id: string;
  index: number;
  title: string;
  question: string;
};
