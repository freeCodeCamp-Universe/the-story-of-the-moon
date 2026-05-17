import CreditCaption from "@/components/CreditCaption";
import OptimizedImage from "@/components/OptimizedImage";
import { getAsset } from "@/content";
import GiantImpactDiagram from "./GiantImpactDiagram";
import styles from "./Ch1.module.css";

export default function Ch1() {
  const asset = getAsset("ch1-giant-impact");

  return (
    <>
      <div className={styles.imageWrapper}>
        <OptimizedImage
          className={styles.heroImage}
          src="/ch1/giant-impact.jpg"
          alt={asset?.alt ?? ""}
          fetchPriority="high"
        />
        {asset && <CreditCaption credit={asset} />}
      </div>

      <div className={styles.prose}>
        <p className={styles.paragraph}>
          The Moon is unusually large for the body it orbits. It's about a
          quarter of Earth&apos;s diameter, more like a small companion world
          than the tiny satellites that circle other rocky planets. Any account
          of where the Moon came from has to explain that size, alongside its
          unique chemical composition and orbital mechanics.
        </p>
        <p className={styles.paragraph}>
          The leading explanation is the giant-impact hypothesis. It proposes
          that about 4.5 billion years ago, while the inner solar system was
          still settling, a Mars-sized body struck the young Earth. Scientists
          call this hypothetical body Theia.
        </p>
        <p className={styles.paragraph}>
          The hypothesis suggests that the collision was oblique rather than
          head-on, at a speed of tens of thousands of kilometers per hour,
          releasing enough energy to vaporize rock and throw a ring of molten
          debris into orbit around Earth. Most of Theia would have merged into
          Earth. The rest, mixed with material torn from Earth&apos;s mantle,
          formed a glowing disk around the planet. Over time, the disk cooled
          and clumped together, and the largest clump pulled itself into a
          sphere. That sphere became the Moon.
        </p>
      </div>

      <GiantImpactDiagram />

      <div className={styles.prose}>
        <p className={styles.paragraph}>
          The giant-impact hypothesis remains the favored model because it
          explains anomalies that other theories cannot:
        </p>
        <ul>
          <li>
            <b>Composition</b>: The Moon&apos;s bulk composition is closer to
            Earth&apos;s mantle than to any meteorite, which is difficult to
            explain if the Moon formed somewhere else and was later captured.
          </li>
          <li>
            <b>Angular Momentum</b>: The Earth-Moon system has unusually large
            angular momentum, which is the total spin built into how Earth
            rotates and the Moon orbits. That much spin can't appear on its own;
            it had to be put in at the start, and a glancing impact is the kind
            of event that would do it.
          </li>
          <li>
            <b>Core Structure</b>: The Moon has only a small iron core,
            consistent with forming mostly from mantle material after the iron
            in both bodies had already settled toward Earth&apos;s center.
          </li>
        </ul>

        <p className={styles.paragraph}>
          The newborn Moon began hot. Its surface was a magma ocean, deep enough
          to remain liquid for millions of years. As the magma cooled, lighter
          minerals floated to the top and crystallized into a pale crust. That
          crust is the lunar highlands you can still see from Earth, the bright
          regions that frame the darker patches. Heavier iron and nickel sank
          inward to form the small core.
        </p>
      </div>
    </>
  );
}
