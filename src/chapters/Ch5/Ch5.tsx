import { CreditCaption } from '@/components/CreditCaption/CreditCaption';
import { OptimizedImage } from '@/components/OptimizedImage/OptimizedImage';
import { Prose } from '@/components/Prose';
import { getAsset, moonSamples } from '@/content';
import { IsotopeMatchPlot } from './IsotopeMatchPlot';
import { MagmaOceanSection } from './MagmaOceanSection';
import styles from './Ch5.module.css';

export default function Ch5() {
  return (
    <>
      <Prose as="p">Apollo astronauts brought home 382 kilograms of lunar material between 1969 and 1972, across six crewed landings.</Prose>

      <section className={styles.section}>
        <Prose as="h3" className={styles.heading}>
          What came back
        </Prose>

        <Prose as="p" className={styles.paragraph}>
          The first surprise for scientists analyzing these samples was what the Moon lacked. Earth's crust is packed with sedimentary rocks like sandstone, limestone, and shale, which form from weathered grains or organic remains. The Moon has none.
          Virtually everything Apollo brought back is igneous, meaning it cooled from molten rock. The only exceptions are breccias, which are shattered fragments welded together by the extreme heat of meteorite impacts.
        </Prose>
        <Prose as="p" className={styles.paragraph}>
          Two families of igneous rock dominate the collection: dark basalts that built the lunar maria, and bright anorthosites that formed the rugged highlands.
        </Prose>
      </section>

      <div className={styles.compare}>
        {moonSamples.map((s) => {
          const credit = getAsset(s.creditId);
          return (
            <figure key={s.id} className={styles.sample}>
              <OptimizedImage className={styles.sampleImage} src={credit ? `/${credit.file}` : undefined} alt={s.alt} loading="lazy" />
              <figcaption className={styles.sampleCaption}>
                {credit && <CreditCaption credit={credit} />}
                <div className={styles.sampleMarker}>
                  <span aria-hidden="true">&gt;</span> {s.marker}
                </div>
                <div className={styles.sampleProperties}>{s.properties}</div>
                <div className={styles.sampleDetail}>{s.detail}</div>
              </figcaption>
            </figure>
          );
        })}
      </div>

      <section className={styles.section}>
        <Prose as="h3" className={styles.heading}>
          An ocean of molten rock
        </Prose>
        <Prose as="p" className={styles.paragraph}>
          Those two families imply something the Apollo geologists were not expecting. If the lighter anorthosite floated to the top of the young Moon while the heavier basalt erupted from below later, the whole Moon must once have been molten. This
          was not a localized phenomenon, but a global ocean of magma hundreds of kilometers deep.
        </Prose>
        <Prose as="p" className={styles.paragraph}>
          This idea, the lunar magma ocean, was proposed soon after the first samples were dated, and the broad outline has held up. A small, hot world cooled from the outside inward. Aluminum-rich minerals were buoyant enough to float, forming a
          pale crust at the surface, while heavier iron- and magnesium-rich minerals sank. Radioactive decay kept the deep interior hot, long enough for basalt lavas to keep pushing through the crust for more than a billion years after the highlands
          had hardened.
        </Prose>
        <MagmaOceanSection
          steps={[
            {
              id: 'molten',
              marker: 'Step 1: Molten ocean',
              caption: 'The young Moon is molten from the surface down, a global ocean of magma hundreds of kilometers deep.',
            },
            {
              id: 'cooling',
              marker: 'Step 2: Cooling from the surface',
              caption: 'Heat escapes at the surface, so the Moon cools from the outside in. Light minerals float upward while heavy ones sink.',
            },
            {
              id: 'crust',
              marker: 'Step 3: Crust over mantle',
              caption: 'The floated minerals harden into a pale crust above a darker, denser mantle. Deep down, the interior is still hot.',
            },
            {
              id: 'maria',
              marker: 'Step 4: Maria erupt later',
              caption: 'For a billion years more, basalt from the hot interior pushes up through the crust and floods the lowlands as the dark maria.',
            },
          ]}
        />
      </section>

      <section className={styles.section}>
        <Prose as="h3" className={styles.heading}>
          A chemical match
        </Prose>
        <Prose as="p" className={styles.paragraph}>
          When geochemists measured the oxygen isotope ratios in lunar rocks, the signatures matched Earth's mantle almost perfectly. This was shocking because most solar system bodies carry a unique isotopic fingerprint based on the specific dust
          cloud they formed from; Mars rocks and meteorites are easily distinguishable from Earth's. The Moon, however, carries a signature nearly identical to Earth's.
        </Prose>
        <IsotopeMatchPlot />
        <Prose as="p" className={styles.paragraph}>
          That observation is why the giant-impact hypothesis has kept evolving rather than being abandoned. If Theia, the impactor, came from a different part of the early solar system, the Moon should look like a blend of Earth and Theia, not like
          pure Earth.
        </Prose>
        <Prose as="p" className={styles.paragraph}>
          Scientists proposed high-energy variants like the "synestia", a model where the impact vaporized both objects into a massive, rapidly spinning cloud of rock gas. This turbulent mist blended the chemistries completely before the Moon
          condensed, offering a compelling explanation for a coincidence that classical impact theories cannot solve.
        </Prose>
      </section>
    </>
  );
}
