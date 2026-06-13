import type { MagmaOceanStep } from '@/types/content';

// The lunar magma ocean, kept at the chapter's altitude: a molten Moon cools
// from the outside in, light minerals float to a pale crust while heavy ones
// sink, and a deep interior stays hot long enough to keep erupting basalt as
// the dark maria. (Lunar magma ocean model after Elkins-Tanton et al. 2011.)
const magmaOcean = [
  { id: 'molten', marker: 'Step 1: Molten ocean', caption: 'The young Moon is molten from the surface down, a global ocean of magma hundreds of kilometers deep.' },
  { id: 'cooling', marker: 'Step 2: Cooling from the surface', caption: 'Heat escapes at the surface, so the Moon cools from the outside in. Light minerals float upward while heavy ones sink.' },
  { id: 'crust', marker: 'Step 3: Crust over mantle', caption: 'The floated minerals harden into a pale crust above a darker, denser mantle. Deep down, the interior is still hot.' },
  { id: 'maria', marker: 'Step 4: Maria erupt later', caption: 'For a billion years more, basalt from the hot interior pushes up through the crust and floods the lowlands as the dark maria.' },
] as const satisfies readonly MagmaOceanStep[];

export default magmaOcean;
