import CreditCaption from '@/components/CreditCaption';
import { getAsset, moonSamples } from '@/content';
import styles from './Ch5.module.css';

export default function Ch5() {
  return (
    <>
      <div className={styles.prose}>
        <p className={styles.paragraph}>
          Six landings, between 1969 and 1972, brought back rocks, cored drill columns, and fine gray soil. NASA stored the samples in sealed nitrogen cabinets at the Johnson Space Center in Houston, where most of them have remained ever since. A
          geologist who requests a fragment today receives a few grams under glass, runs the test, and returns whatever isn&apos;t consumed. The careful handling isn&apos;t preservation for its own sake. Every decade brings instruments that did not
          exist before, and material collected in 1972 is still producing first-time discoveries for researchers who weren&apos;t born when it was collected from the lunar surface.
        </p>
        <p className={styles.paragraph}>
          The first surprise was what the rocks were not. Earth&apos;s crust is full of sedimentary material: sandstone, limestone, shale, anything built up from weathered grains or the remains of living things. The Moon has none of it. Without wind,
          flowing water, or life, the processes that produce sedimentary rock on Earth never started on the Moon. Almost everything Apollo brought back is igneous, meaning it cooled from molten rock.
        </p>
        <p className={styles.paragraph}>Within that igneous category, two families dominate the collection: basalt, which built the dark maria, and anorthosite, which built the bright highlands.</p>
      </div>

      <div className={styles.compare}>
        {moonSamples.map((s) => {
          const credit = getAsset(s.creditId);
          return (
            <figure key={s.id} className={styles.sample}>
              <img className={styles.sampleImage} src={credit ? `/${credit.file}` : undefined} alt={s.alt} />
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

      <div className={styles.prose}>
        <p className={styles.paragraph}>
          The two families also imply something the Apollo geologists were not expecting. If the lighter anorthosite crust crystallized early and floated to the top, and the darker basalt erupted later from below, then the whole Moon must once have
          been molten. Not partly molten, but a global ocean of liquid rock hundreds of kilometers deep. This idea, the lunar magma ocean, was proposed soon after the first samples were dated, and the broad outline has held up. A small, hot world
          cooled from the outside in. A buoyant aluminum-rich crust formed at the surface while heavier minerals sank toward the interior. Heat from radioactive decay kept the inside molten long enough for basalt lavas to continue to erupt through
          the crust for more than a billion years after the highlands had hardened.
        </p>
        <p className={styles.paragraph}>
          Some Apollo basalts preserve tiny details from the moment they cooled. Apollo 11 returned a sample that contained a mineral nobody on Earth had seen before: a dark, opaque oxide of iron, magnesium, and titanium. It was named armalcolite,
          for Armstrong, Aldrin, and Collins. Trace amounts have since been found in a few unusual settings on Earth, but the Moon is where it was identified first.
        </p>
        <p className={styles.paragraph}>
          The most consequential result was slower to arrive. When geochemists measured the ratios of oxygen isotopes in lunar basalts and anorthosites, the numbers matched Earth&apos;s mantle almost exactly. That kind of match is rare. Most
          planetary bodies carry their own isotopic fingerprint, formed from the particular mix of dust and gas they grew out of. The Moon&apos;s matches Earth&apos;s. That observation, more than any other, is why the giant-impact hypothesis has kept
          evolving rather than being abandoned. One model, called the synestia, proposes that the impact briefly merged Earth and Theia into a single rapidly spinning cloud of vaporized rock, hot enough and turbulent enough that the two chemistries
          blended before the Moon condensed back out. That kind of event is severe enough to leave behind the chemistry the rocks actually show.
        </p>
      </div>
    </>
  );
}
