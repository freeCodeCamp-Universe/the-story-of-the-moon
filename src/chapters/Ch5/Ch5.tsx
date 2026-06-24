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
          These two distinct rock families revealed a twist that took Apollo geologists completely by surprise: the entire Moon must have once been a molten ball. This was no localized volcanic eruption, but a global ocean of white-hot magma hundreds
          of kilometers deep.
        </Prose>
        <Prose as="p" className={styles.paragraph}>
          As the small world slowly cooled from the outside inward, it behaved like a giant pot of soup. Light, aluminum-rich minerals floated to the top like foam, cooling into the pale, bright crust. Meanwhile, heavy iron and magnesium sank into
          the depths. Deep underground, trapped heat kept the interior molten for another billion years. Liquid rock repeatedly burst through the crust, flooding low areas to form the dark patches visible today.
        </Prose>
        <Prose as="p" className={styles.paragraph}>
          This "lunar magma ocean" theory was proposed shortly after the first moon rocks were dated, and it remains the leading explanation.
        </Prose>
        <MagmaOceanSection
          steps={[
            {
              id: 'molten',
              marker: 'Molten ocean',
              caption: 'The young Moon is molten from the surface down, a global ocean of magma hundreds of kilometers deep.',
            },
            {
              id: 'cooling',
              marker: 'Cooling from the surface',
              caption: 'Heat escapes at the surface, so the Moon cools from the outside in. Light minerals float upward while heavy ones sink.',
            },
            {
              id: 'crust',
              marker: 'Crust over mantle',
              caption: 'The floated minerals harden into a pale crust above a darker, denser mantle. Deep down, the interior is still hot.',
            },
            {
              id: 'maria',
              marker: 'Maria erupt later',
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
          Most solar system bodies carry a unique isotopic fingerprint based on the specific dust cloud they formed from. These isotopes are atomic variants of an element that act as a birthplace signature. This allows scientists to easily
          distinguish meteorites, including those from Mars, from Earth's own rocks.
        </Prose>
        <Prose as="p" className={styles.paragraph}>
          However, when geochemists analyzed the Moon's oxygen isotopes, they found a very different story. The lunar signatures matched Earth's almost perfectly.
        </Prose>
        <IsotopeMatchPlot />
        <Prose as="p" className={styles.paragraph}>
          This observation directly challenges the giant-impact hypothesis. The impactor, Theia, is believed to have formed in a different part of the early solar system, meaning it carried its own distinct chemical signature. Therefore, the Moon
          should look like a blend of Earth and Theia, not like pure Earth.
        </Prose>
        <Prose as="p" className={styles.paragraph}>
          Rather than discard the hypothesis, scientists proposed high-energy variants like the "synestia", a model where the impact churned most of Earth and Theia into a single, spinning cloud of liquid rock and vapor. Within this cloud, the two
          worlds blended completely, erasing the fingerprint that set them apart. As the cloud cooled, the outer part formed the Moon, while the rest settled back down into the Earth. This explanation offers one possible way to reconcile a violent
          collision with the nearly identical chemistry, but it's far from settled.
        </Prose>
      </section>
    </>
  );
}
