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
