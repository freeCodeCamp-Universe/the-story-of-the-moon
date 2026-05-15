import type { MoonSampleSource } from '@/types/content';
import type { AssetCreditId } from './assets';

const moonSamples = [
  {
    "id": "basalt-70017",
    "mission": "Apollo 17",
    "sampleNumber": "70017",
    "rockType": "basalt",
    "marker": "basalt",
    "properties": "dark. heavy. iron and titanium.",
    "detail": "This is rock that erupted as lava and flooded the Moon's low basins. When it cooled, it formed the smooth gray maria you see when you look up at the Moon.",
    "creditId": "ch5-basalt-70017"
  },
  {
    "id": "anorthosite-15415",
    "mission": "Apollo 15",
    "sampleNumber": "15415",
    "rockType": "anorthosite",
    "marker": "anorthosite",
    "properties": "pale. lighter. aluminum, calcium, silicon.",
    "detail": "This is rock that crystallized early in the Moon's magma ocean and floated to the surface as it cooled. It formed the bright cratered highlands that surround the maria.",
    "creditId": "ch5-anorthosite-15415"
  }
] as const satisfies readonly MoonSampleSource<AssetCreditId>[];

export default moonSamples;
