import type { SurfaceFeature } from '@/types/content';

const surfaceFeatures = [
  {
    id: 'mare-imbrium',
    name: 'Mare Imbrium',
    lat: 32.8,
    lon: -15.6,
    diameterKm: 1145,
    description: [
      'Mare Imbrium is the largest dark plain on the side of the Moon that faces Earth, about 1,145 kilometers across. A massive impactor punched out the basin around 3.9 billion years ago.',
      "Over the next several hundred million years, lava welled up from the lunar interior and flooded the basin floor, freezing into the dark basalt visible today. The basin's outer rim is preserved as a ring of mountain ranges, including the Apennines and the Alps.",
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
      'Soon after, lava welled up through fractures in its floor and filled it almost to the rim, leaving one of the smoothest, darkest patches on the near side. Plato is a useful example of how the crater and basin categories blur at intermediate scales: the bowl is a crater, but its filling is mare basalt.',
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
      "Its high-reflectance ejecta and central peak make it a prominent landmark, and the surrounding plateau is one of the Moon's most geologically interesting regions, with evidence of ancient volcanic activity and strange optical effects seen from Earth.",
    ],
  },
  {
    id: 'tycho',
    name: 'Tycho',
    lat: -43.3,
    lon: -11.2,
    diameterKm: 85,
    description: [
      'Tycho is a sharp young crater roughly 85 kilometers wide. It formed about 108 million years ago, recent enough that dinosaurs were still alive on Earth at the time.',
      'The collision blasted out long bright streaks of pulverized rock, called rays, that still reach for thousands of kilometers across the surface. They survive because the Moon has no weather to fade them, and because Tycho has not had enough geological time for nearby impacts to churn the rays under.',
    ],
  },
  {
    id: 'oceanus-procellarum',
    name: 'Oceanus Procellarum',
    lat: 18.4,
    lon: -57.4,
    diameterKm: 2500,
    description: [
      'Oceanus Procellarum is the largest mare on the Moon, stretching about 2,500 kilometers along the western part of the near side. Unlike the round basins, it is a sprawling patchwork of overlapping lava flows with no clean rim.',
      "Findings from NASA's GRAIL gravity-mapping mission, published in 2014, suggest that the crust beneath Procellarum is unusually thin, which would have made it easier for lava to break through and spread across a wide area for hundreds of millions of years.",
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
      'The shadowed floor stays near 90 K (−183 °C), cold enough to lock away water and other volatiles for billions of years. This is why permanently shadowed craters like Shackleton are the prime suspects for buried lunar ice. The evidence so far is suggestive rather than settled. The floor reflects more light than neighboring crater floors, as a layer of ice would, but freshly disturbed soil reflects much the same way, and no measurement has yet confirmed ice on the surface.',
      'The combination of steady sunlight and potential ice is why NASA selected a ridge beside the crater for its first Moon Base landing in late 2026, serving as a critical step toward returning astronauts to the surface later this decade.',
    ],
  },
] as const satisfies readonly SurfaceFeature[];

export default surfaceFeatures;
