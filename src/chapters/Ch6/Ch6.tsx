import { CreditCaption } from '@/components/CreditCaption/CreditCaption';
import { OptimizedImage } from '@/components/OptimizedImage/OptimizedImage';
import { getAsset } from '@/content';
import { Prose } from '@/components/Prose';
import type { AssetCredit } from '@/types/content';

import { LunarSwirlScene } from './LunarSwirlScene';
import { PolarIceFigure } from './PolarIceFigure';
import styles from './Ch6.module.css';

type ChapterFigureProps = {
  credit?: AssetCredit;
};

function ChapterFigure({ credit }: ChapterFigureProps) {
  if (!credit) {
    return null;
  }

  return (
    <figure className={styles.figure}>
      <div className={styles.figureFrame}>
        <OptimizedImage
          className={styles.figureImage}
          src={`/${credit.file}`}
          alt={credit.alt}
          loading="lazy"
        />
      </div>
      <CreditCaption credit={credit} />
    </figure>
  );
}

export default function Ch6() {
  const erlangerCredit = getAsset('erlanger-crater');
  const tranquillitatisCredit = getAsset('tranquillitatis-pit');
  const moonNearSideCredit = getAsset('moon-near-side');
  const moonFarSideCredit = getAsset('moon-far-side');

  return (
    <>
      <Prose className={styles.intro}>
        <p>
          For thousands of years, our nearest neighbor in space has been
          watched, sketched, mapped, and photographed in fine detail, and yet
          there are still parts of it nobody has been to and features of it
          nobody has fully explained.
        </p>
      </Prose>

      <section className={styles.section} aria-labelledby="ch6-shadow-heading">
        <div className={styles.sectionContent}>
          <div className={styles.textColumn}>
            <div className={styles.sectionHeader}>
              <h3 id="ch6-shadow-heading" className={styles.sectionTitle}>
                Floors in permanent shadow
              </h3>
            </div>
            <Prose flush className={styles.copyBlock}>
              <p>
                Near the Moon&apos;s poles, the floors of some craters have
                stayed in darkness for around two billion years, because the Sun
                never quite lifts above the rim.
              </p>
              <p>
                With no sunlight to warm them, the deepest of these floors sit
                close to −240 °C, among the coldest places measured anywhere in
                the solar system. Anything that has fallen into them, whether
                comet fragments, asteroid dust, or particles carried in by the
                solar wind, has had nowhere to go and is still there. Water ice
                is part of what accumulated, frozen into the soil.
              </p>
              <p>
                From orbit, instruments have detected it by mapping hydrogen and
                measuring temperature. But nothing has reached the floor of
                these craters to sample it.
              </p>
            </Prose>
          </div>
          <ChapterFigure credit={erlangerCredit} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ch6-water-heading">
        <div className={styles.sectionContent}>
          <div className={styles.textColumn}>
            <div className={styles.sectionHeader}>
              <h3 id="ch6-water-heading" className={styles.sectionTitle}>
                Water on the Moon
              </h3>
            </div>
            <Prose flush className={styles.copyBlock}>
              <p>
                Despite looking bone-dry, the Moon hides water in three places:
                trace molecules across the sunlit surface, water locked inside
                impact glass beads in the soil, and ice frozen in permanently
                shadowed polar craters. How it got there is a major scientific
                debate with three main theories:
              </p>
              <ul>
                <li>
                  <b>The Sun</b>: The solar wind constantly streams hydrogen
                  onto the Moon, where it bonds with oxygen in the soil to
                  create water. Soil samples brought back by China&apos;s
                  Chang&apos;e-6 mission show evidence of this process, but it
                  only explains the water found on the very top layer, leaving
                  deeper deposits a mystery.
                </li>
                <li>
                  <b>Comets and asteroids</b>: Icy comets and asteroids heavily
                  bombarded the early Moon, leaving water behind when they
                  crashed. While some Apollo samples chemically match these
                  space rocks, scientists question how that water could have
                  survived the extreme heat of the Moon&apos;s early, molten
                  magma ocean.
                </li>
                <li>
                  <b>Ancient Earth</b>: As the giant impact formed the Moon, the
                  new Moon may have inherited some of Earth's water. Water deep
                  inside certain Apollo rocks carries the same hydrogen
                  signature as Earth's, supporting this idea, yet the extreme
                  heat of that impact should have vaporized it all.
                </li>
              </ul>
              <p>
                A single conclusion remains out of reach because different rocks
                tell contradictory stories, and no spacecraft has yet sampled
                the polar ice to help settle the question.
              </p>
            </Prose>
          </div>
          <PolarIceFigure />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ch6-tunnels-heading">
        <div className={styles.sectionContent}>
          <div className={styles.textColumn}>
            <div className={styles.sectionHeader}>
              <h3 id="ch6-tunnels-heading" className={styles.sectionTitle}>
                Tunnels under the surface
              </h3>
            </div>
            <Prose flush className={styles.copyBlock}>
              <p>
                In a few places on the Moon, the ground opens. One of the larger
                such openings sits on the Sea of Tranquillity: a roughly
                circular pit about a hundred meters across, with the floor
                visible through the gap.
              </p>
              <p>
                It isn&apos;t a crater but the collapsed roof of a tunnel. When
                the dark plains of the Moon were young, lava flowed across them
                in long sheets, and the top of a flow would cool and crust over
                while fresh lava kept moving underneath. Once the source ran
                dry, the molten rock drained out, leaving an empty channel
                behind.
              </p>
              <p>
                Radar readings published in 2024 confirmed that the pit opens
                into a cave at least forty meters wide, reaching tens of meters
                back into the dark. On the Moon, lower gravity lets such tubes
                grow far wider than any cave on Earth; the largest could in
                theory be wide enough to hold a small city. Nothing has been
                inside one, and the floors and walls are still as the lava left
                them.
              </p>
            </Prose>
          </div>
          <ChapterFigure credit={tranquillitatisCredit} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ch6-swirl-heading">
        <div className={styles.sectionContent}>
          <div className={styles.textColumn}>
            <div className={styles.sectionHeader}>
              <h3 id="ch6-swirl-heading" className={styles.sectionTitle}>
                Bright ground over buried magnets
              </h3>
            </div>
            <Prose flush className={styles.copyBlock}>
              <p>
                Scattered across the Moon's dark plains are bright, looping
                patterns called lunar swirls. One prominent swirl, Reiner Gamma,
                looks like a splash of pale paint across Oceanus Procellarum.
                Early observers thought it was high ground, but it casts no
                shadow, proving it is a completely flat, highly reflective
                marking.
              </p>
              <p>
                Every swirl sits atop a localized magnetic anomaly where the
                crust is unusually magnetized. This supports the leading
                hypothesis that these magnetic fields act like a sunscreen
                against the solar wind. While this steady stream of solar
                particles darkens bare lunar soil over millions of years, the
                magnetic bubble deflects much of it. This suggests a swirl is
                not new material, but the Moon's original surface brightness
                kept from fading.
              </p>
              <p>
                However, this solar wind hypothesis is not yet settled. A
                passing comet's gas or magnetically sorted dust could also
                create these loops. To find answers, NASA's Lunar Vertex mission
                is set to land instruments directly inside Reiner Gamma to
                collect the first-ever ground measurements of a lunar swirl.
              </p>
            </Prose>
          </div>
          <LunarSwirlScene />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ch6-halves-heading">
        <div
          className={`${styles.sectionContent} ${styles.sectionContentFlow}`}
        >
          <div className={styles.textColumn}>
            <div className={styles.sectionHeader}>
              <h3 id="ch6-halves-heading" className={styles.sectionTitle}>
                Two halves that don&apos;t match
              </h3>
            </div>
            <Prose flush className={styles.copyBlock}>
              <p>
                The Moon is tidally locked to Earth: it takes exactly as long to
                spin once on its axis as it does to orbit Earth, so the same
                side always faces us and we never see the "back" of it. This
                hidden hemisphere stayed unseen until October 1959, when the
                Soviet Luna 3 spacecraft photographed the far side and revealed
                a landscape no one expected.
              </p>
              <div className={styles.figurePair}>
                <ChapterFigure credit={moonNearSideCredit} />
                <ChapterFigure credit={moonFarSideCredit} />
              </div>
              <p>
                The near side features wide, dark plains of ancient lava, warmer
                internal temperatures, and abundant radioactive elements. The
                far side is rougher, paler, heavily cratered, and carries a
                crust tens of kilometers thicker.
              </p>
              <p>
                For a body so small and so close to spherical, there is no clear
                reason for the two halves to differ this much. Despite decades
                of study, scientists have yet to reach a single consensus,
                though several theories have been proposed:
              </p>
              <ul>
                <li>
                  <b>The &ldquo;Big Splat&rdquo; Theory</b>: A smaller,
                  secondary moon once coexisted with ours before eventually
                  colliding with the far side, leaving behind a thick layer of
                  new crust.
                </li>
                <li>
                  <b>The Earthshine Theory</b>: Earth's early heat acted like a
                  lamp. A molten Earth warmed the Moon's near side and kept it
                  liquid, while the shielded far side cooled quickly and formed
                  a thicker crust first.
                </li>
                <li>
                  <b>Internal Warming Hypotheses</b>: The Moon warmed up
                  unevenly from the inside out, trapping hot, active magma under
                  the near side while the far side quickly went cold and rigid.
                </li>
              </ul>
            </Prose>
          </div>
        </div>
      </section>
    </>
  );
}
