export type AssetCredit = {
  id: string;
  file: string;
  title: string;
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
  oneLiner: string;
};

export type Mission = {
  key: string;
  label: string;
  date: string;
  splashdownDate: string;
  crew: string[];
  oneLiner: string;
  prose: string[];
  photo: { src: string; alt: string; creditId: string };
};

export type GapEntry = {
  type: 'gap';
  prose: string;
  photo: { src: string; alt: string; creditId: string };
};

export type MissionEntry = Mission | GapEntry;

export type MoonSample = {
  id: string;
  mission: string;
  sampleNumber: string;
  rockType: string;
  marker: string;
  properties: string;
  detail: string;
  alt: string;
  creditId: string;
};

export type PostcardData = {
  id: string;
  placement: { after: 'ch2' | 'ch3' | 'ch5' };
  image: { src: string; alt: string; creditId: string };
  caption: string;
};

export type ChapterMeta = {
  id: string;
  index: number;
  title: string;
  question: string;
};
