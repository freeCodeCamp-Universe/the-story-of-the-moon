import { CreditCaption } from "@/components/CreditCaption/CreditCaption";
import { OptimizedImage } from "@/components/OptimizedImage/OptimizedImage";
import { getAsset, moonSamples } from "@/content";
import styles from "./Ch5.module.css";

export default function Ch5() {
  return (
    <>
      <p className={styles.intro}>
        Apollo astronauts brought home 382 kilograms of lunar material between
        1969 and 1972, across six crewed landings.
      </p>

      <section className={styles.section}>
        <h3 className={styles.heading}>What came back</h3>

        <p className={styles.paragraph}>
          The first surprise for scientists analyzing these samples was what the
          Moon lacked. Earth's crust is packed with sedimentary rocks like
          sandstone, limestone, and shale, which form from weathered grains or
          organic remains. The Moon has none. Virtually everything Apollo
          brought back is igneous, meaning it cooled from molten rock. The only
          exceptions are breccias, which are shattered fragments welded together
          by the extreme heat of meteorite impacts.
        </p>
        <p className={styles.paragraph}>
          Two families of igneous rock dominate the collection: dark basalts
          that built the lunar maria, and bright anorthosites that formed the
          rugged highlands.
        </p>
      </section>

      <div className={styles.compare}>
        {moonSamples.map((s) => {
          const credit = getAsset(s.creditId);
          return (
            <figure key={s.id} className={styles.sample}>
              <OptimizedImage
                className={styles.sampleImage}
                src={credit ? `/${credit.file}` : undefined}
                alt={s.alt}
                loading="lazy"
              />
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
        <h3 className={styles.heading}>An ocean of molten rock</h3>
        <p className={styles.paragraph}>
          Those two families imply something the Apollo geologists were not
          expecting. If the lighter anorthosite floated to the top of the young
          Moon while the heavier basalt erupted from below later, the whole Moon
          must once have been molten. This was not a localized phenomenon, but a
          global ocean of magma hundreds of kilometers deep.
        </p>
        <p className={styles.paragraph}>
          This idea, the lunar magma ocean, was proposed soon after the first
          samples were dated, and the broad outline has held up. A small, hot
          world cooled from the outside inward. Aluminum-rich minerals were
          buoyant enough to float, forming a pale crust at the surface, while
          heavier iron- and magnesium-rich minerals sank. Radioactive decay kept
          the deep interior hot, long enough for basalt lavas to keep pushing
          through the crust for more than a billion years after the highlands
          had hardened.
        </p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.heading}>A chemical match</h3>
        <p className={styles.paragraph}>
          The most profound discovery took longer to emerge. When geochemists
          measured the oxygen isotope ratios in lunar rocks, the signatures
          matched Earth’s mantle almost perfectly. This was shocking because
          most solar system bodies carry a unique isotopic fingerprint based on
          the specific dust cloud they formed from; Mars rocks and meteorites
          are easily distinguishable from Earth's. The Moon, however, shares
          Earth's exact chemical signature.
        </p>
        <p className={styles.paragraph}>
          That observation is why the giant-impact hypothesis has kept evolving
          rather than being abandoned. If Theia, the impactor, came from a
          different part of the early solar system, the Moon should look like a
          blend of Earth and Theia, not like pure Earth. Scientists proposed
          high-energy variants like the "synestia", a model where the impact
          vaporized both objects into a massive, rapidly spinning cloud of rock
          gas. This turbulent mist blended the chemistries completely before the
          Moon condensed, offering a compelling explanation for a coincidence
          that classical impact theories cannot solve.
        </p>
      </section>
    </>
  );
}
