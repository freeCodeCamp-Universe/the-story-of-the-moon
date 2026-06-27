import type { IsotopeBody } from '@/types/content';

// The classic oxygen three-isotope plot: each body's rocks carry a distinct
// signature, so each falls on its own fractionation line, except the Moon,
// which falls on Earth's. Δ17O (per mil) sets each line's vertical offset from
// Earth's. Mars from SNC meteorites, Vesta from HED meteorites; Earth and Moon
// are indistinguishable to within a few parts per million. (Wiechert et al.
// 2001; refined by Herwartz 2014, Cano 2020, and sub-ppm work since.)
const isotopeBodies = [
  {
    id: 'moon',
    name: 'Moon',
    delta17O: 0,
    valueLabel: '≈ 0',
    detail:
      "Apollo lunar samples. Their oxygen matches Earth's to within a few parts per million.",
  },
  {
    id: 'earth',
    name: 'Earth',
    delta17O: 0,
    valueLabel: '≡ 0',
    detail:
      "Rocks from Earth's mantle, the baseline that every other value is measured against.",
  },
  {
    id: 'vesta',
    name: 'Vesta (asteroid)',
    delta17O: -0.24,
    valueLabel: '−0.24',
    detail:
      'Meteorites from Vesta, one of the largest bodies in the asteroid belt.',
  },
  {
    id: 'mars',
    name: 'Mars',
    delta17O: 0.3,
    valueLabel: '+0.30',
    detail:
      'Meteorites that fell to Earth. No rock has ever been brought back from Mars directly.',
  },
] as const satisfies readonly IsotopeBody[];

export default isotopeBodies;
