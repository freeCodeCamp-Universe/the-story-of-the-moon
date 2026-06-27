import type { SurfaceFeature } from '@/types/content';

const surfaceFeatures = [
  {
    id: 'mare-imbrium',
    name: 'Mare Imbrium',
    lat: 32.8,
    lon: -15.6,
    diameterKm: 1145,
    description: [
      'Mare Imbrium is one of the largest dark plains on the side of the Moon facing Earth, a nearly circular basin about 1,145 kilometers across, punched out by a massive impactor around 3.9 billion years ago.',
      "Over the next several hundred million years, lava rose from the lunar interior and flooded the basin floor, hardening into the dark basalt visible today. The basin's outer rim is preserved as a ring of mountain ranges, including the Apennines and the Alps.",
    ],
  },
  {
    id: 'plato',
    name: 'Plato',
    lat: 51.6,
    lon: -9.4,
    diameterKm: 101,
    description: [
      'Plato is a flat-floored crater about 101 kilometers across, sitting on the northern edge of Mare Imbrium. The original bowl formed roughly 3.85 billion years ago.',
      'Soon after, lava pushed up through fractures in its floor and filled it almost to the rim, leaving one of the smoothest, darkest patches on the near side. Plato is a useful example of how the crater and basin categories blur at intermediate scales: the bowl is a crater, but its filling is mare basalt.',
    ],
  },
  {
    id: 'copernicus',
    name: 'Copernicus',
    lat: 9.62,
    lon: -20.08,
    diameterKm: 93,
    description: [
      'Copernicus is a textbook example of a complex crater, about 93 kilometers across and roughly 800 million years old. The collision that formed it released enough energy to make solid rock briefly behave like a fluid.',
      'The walls slumped inward into a series of stair-step terraces, and the floor rebounded upward at the center into a cluster of peaks. Almost every large fresh crater on the Moon shows the same pattern.',
    ],
  },
  {
    id: 'aristarchus',
    name: 'Aristarchus',
    lat: 23.7,
    lon: -47.4,
    diameterKm: 40,
    description: [
      'Aristarchus is one of the brightest large craters on the Moon, about 40 kilometers across and located on the northwestern near side.',
      "Its bright debris streaks and central peak make it easy to spot, but the surrounding plateau is the focal point. This tilted block of crust holds the Moon's densest network of winding lava channels and its largest deposit of volcanic ash.",
      'For centuries, telescope users have reported brief glows, hazes, and color changes on the plateau, more often than anywhere else on the Moon. These events, known as transient lunar phenomena, may be caused by gas escaping from below the surface.',
    ],
  },
  {
    id: 'tycho',
    name: 'Tycho',
    lat: -43.3,
    lon: -11.2,
    diameterKm: 85,
    description: [
      'Tycho is a crater about 85 kilometers wide. The Moon has thousands of craters this size, but Tycho stands out because it is relatively young. It formed only about 108 million years ago, far younger than most craters its size, which date back billions of years.',
      "The crater was blasted out by an asteroid between 8 and 10 kilometers wide. The collision threw out huge amounts of crushed rock, creating long, bright streaks called rays that still stretch across much of the Moon's near side. The rays survive because the Moon has no wind or rain to wear them away, and because Tycho is young enough that later impacts have not yet mixed the bright material into the darker soil.",
    ],
  },
  {
    id: 'oceanus-procellarum',
    name: 'Oceanus Procellarum',
    lat: 18.4,
    lon: -57.4,
    diameterKm: 2500,
    description: [
      'Oceanus Procellarum is the largest mare on the Moon, stretching about 2,500 kilometers across the western edge of the near side. Unlike most lunar basins, which are round with clear borders, Procellarum is a vast, uneven spread of lava flows that merged together.',
      "In 2014, NASA's GRAIL mission found a rectangular network of buried cracks, called rifts, beneath the surface. Because asteroid impacts create round craters rather than sharp-cornered rectangles, scientists believe the feature formed in a different way. As this hot region cooled and shrank long ago, it split open like drying mud, and the cracks let lava rise and flood the surface for hundreds of millions of years.",
    ],
  },
  {
    id: 'mare-orientale',
    name: 'Mare Orientale',
    lat: -19.87,
    lon: -94.67,
    diameterKm: 930,
    description: [
      "Mare Orientale is a massive impact basin near the Moon's western edge, sitting across the boundary between the near and far side. It formed roughly 3.8 billion years ago when an asteroid struck the surface, and from above it resembles a giant bullseye. The collision threw up three concentric rings of mountains, with the outermost spanning about 930 kilometers across.",
      "On most lunar plains, lava completely flooded the landscape, hardening into flat, dark rock. Mare Orientale, however, was barely flooded; the lava reached only its center, leaving its massive mountain rings intact. The basin stands as the Moon's clearest example of how giant impacts shaped a surface early in the solar system's history.",
    ],
  },
  {
    id: 'south-pole-aitken',
    name: 'South Pole-Aitken basin',
    lat: -53,
    lon: -169,
    diameterKm: 2500,
    description: [
      'The South Pole-Aitken basin, located on the lunar far side, is one of the largest and oldest impact structures known anywhere in the solar system, roughly 2,500 kilometers across and at least four billion years old.',
      "The collision is thought to have punched deep enough to expose material from the lower crust, and possibly the upper mantle. That depth makes it the prime natural laboratory for studying the Moon's deep interior.",
    ],
  },
  {
    id: 'shackleton',
    name: 'Shackleton',
    lat: -89.67,
    lon: 129.78,
    diameterKm: 21,
    description: [
      "Shackleton is a small crater, about 21 kilometers across and 3.6 billion years old, located almost exactly on the Moon's south pole. Because the Moon tilts very little on its axis, the crater floor remains in permanent shadow, while the peaks along its rim receive sunlight through most of the lunar day.",
      'The dark crater floor stays at a freezing −183 °C, cold enough to trap water for billions of years. Because of this, permanently shadowed craters like Shackleton are among the best places to search for possible buried ice.',
      'In late 2026, NASA will make its first Moon Base landing on a ridge near the crater as a critical step toward returning astronauts to the surface later this decade.',
    ],
  },
] as const satisfies readonly SurfaceFeature[];

export default surfaceFeatures;
