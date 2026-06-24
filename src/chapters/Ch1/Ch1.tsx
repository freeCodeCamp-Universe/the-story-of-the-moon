import { CreditCaption } from '@/components/CreditCaption/CreditCaption';
import { OptimizedImage } from '@/components/OptimizedImage/OptimizedImage';
import { Prose } from '@/components/Prose';
import { getAsset } from '@/content';
import GiantImpactDiagram from './GiantImpactDiagram';
import styles from './Ch1.module.css';

export default function Ch1() {
  const asset = getAsset('ch1-giant-impact');

  return (
    <>
      <div className={styles.imageWrapper}>
        <OptimizedImage className={styles.heroImage} src="/ch1/giant-impact.jpg" alt={asset?.alt ?? ''} loading="eager" fetchPriority="high" />
        {asset && <CreditCaption credit={asset} />}
      </div>

      <Prose className={styles.prose}>
        <p className={styles.paragraph}>
          The Moon is unusually large for the body it orbits. It's about a quarter of Earth&apos;s diameter, more like a small companion world than the tiny satellites that circle other rocky planets. Any account of where the Moon came from has to
          explain that size, alongside its unique chemical composition and orbital mechanics.
        </p>
        <p className={styles.paragraph}>
          The leading explanation is the giant-impact hypothesis. It proposes that about 4.5 billion years ago, while the inner solar system was still settling, a Mars-sized body struck the young Earth. Scientists call this hypothetical body Theia.
        </p>
        <p className={styles.paragraph}>
          The hypothesis suggests that the collision was oblique rather than head-on, at a speed of tens of thousands of kilometers per hour, releasing enough energy to vaporize rock and throw a ring of molten debris into orbit around Earth.
        </p>
        <p className={styles.paragraph}>
          Most of Theia would have merged into Earth. The rest, mixed with material torn from Earth&apos;s mantle, formed a glowing disk around the planet. Over time, the disk cooled and clumped together, and the largest clump pulled itself into a
          sphere. That sphere became the Moon.
        </p>
      </Prose>

      <GiantImpactDiagram />

      <Prose className={styles.prose}>
        <p className={styles.paragraph}>The giant-impact hypothesis remains the favored model because it explains anomalies that other theories cannot:</p>
        <ul>
          <li>
            <b>Angular Momentum</b>: The Earth-Moon system has unusually large angular momentum, which is the total spin built into how Earth rotates and the Moon orbits. That much spin can't build up on its own; it had to be put in at the start, and
            a glancing impact is the kind of event that would do it.
          </li>
          <li>
            <b>Composition</b>: The Moon is built from much the same material as Earth's mantle. Its chemistry sits far closer to Earth's than to Mars or to any meteorite, and rock from elsewhere in the solar system carries a different signature. A
            Moon captured from somewhere else should not match Earth this closely.
          </li>
          <li>
            <b>Core Structure</b>: The Moon holds very little iron. Its core is tiny, less than a quarter of its radius, where most rocky worlds run nearer to half. That fits a Moon made mainly from mantle rock, gathered after the heavy iron in both
            Earth and Theia had already sunk to their centers.
          </li>
          <li>
            <b>Volatiles</b>: The Moon is short on volatile elements, the ones that vaporize at relatively low temperatures, such as water and zinc. Lunar rocks carry the mark of material heated until its lighter parts boiled away, which is what a
            hot impact would do as it flung vaporized debris into orbit.
          </li>
        </ul>

        <p className={styles.paragraph}>
          The newborn Moon began hot. Its surface was a deep magma ocean that stayed liquid for about a hundred million years. As this molten surface cooled, the heaviest iron sank to form the core, while lighter rocks floated to the top and hardened
          into a pale crust. That ancient crust forms the bright lunar highlands, framing the Moon's darker patches.
        </p>
      </Prose>
    </>
  );
}
