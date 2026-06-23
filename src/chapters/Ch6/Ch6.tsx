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
        <OptimizedImage className={styles.figureImage} src={`/${credit.file}`} alt={credit.alt} loading="lazy" />
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
        <p>For thousands of years, our nearest neighbor in space has been watched, sketched, mapped, and photographed in fine detail, and yet there are still parts of it nobody has been to and features of it nobody has fully explained.</p>
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
              <p>Near the Moon&apos;s poles, the floors of some craters have stayed in darkness for around two billion years, because the Sun never quite lifts above the rim.</p>
              <p>
                With no sunlight to warm them, the deepest of these floors sit close to minus 240 degrees Celsius, among the coldest places measured anywhere in the solar system. Anything that has fallen into them, whether comet fragments, asteroid
                dust, or particles carried in by the solar wind, has had nowhere to go and is still there. Water ice is part of what accumulated, frozen into the soil.
              </p>
              <p>From orbit, instruments have detected it by mapping hydrogen and measuring temperature. But nothing has reached the floor of these craters to sample it.</p>
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
                Despite looking completely bone-dry, the Moon hides water in several places. Satellites can detect trace water molecules scattered across the sunlit surface, tiny glass beads formed by asteroid impacts lock water deep inside the soil,
                and massive reserves of ice sit frozen inside permanently shadowed craters at the lunar poles. How all this water got there is a major scientific debate centered on three competing possibilities:
              </p>
              <ul>
                <li>
                  <b>The Sun</b>: The solar wind constantly streams hydrogen onto the Moon, where it bonds with oxygen in the soil to create water. Soil samples brought back by China&apos;s Chang&apos;e-6 mission show evidence of this process, but it
                  only explains the water found on the very top layer, leaving deeper deposits a mystery.
                </li>
                <li>
                  <b>Comets and asteroids</b>: Icy comets and asteroids heavily bombarded the early Moon, leaving water behind when they crashed. While some Apollo samples chemically match these space rocks, scientists question how that water could
                  have survived the extreme heat of the Moon&apos;s early, molten magma ocean.
                </li>
                <li>
                  <b>Ancient Earth</b>: The Moon might have inherited water directly from the original planetary material that built it. Deep interior signatures in certain Apollo rocks match Earth&apos;s own chemistry, but the violent collision that
                  originally broke the Moon away from Earth should have vaporized those volatiles.
                </li>
              </ul>
              <p>A single conclusion remains out of reach because different rocks offer contradictory histories, and no spacecraft has yet sampled the polar ice to settle the question.</p>
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
              <p>In a few places on the Moon, the ground opens. One of the larger such openings sits on the Sea of Tranquillity: a roughly circular pit about a hundred meters across, with the floor visible through the gap.</p>
              <p>
                It isn&apos;t a crater but the collapsed roof of a tunnel. When the dark plains of the Moon were young, lava flowed across them in long sheets, and the top of a flow would cool and crust over while fresh lava kept moving underneath.
                Once the source ran dry, the molten rock drained out, leaving an empty channel behind.
              </p>
              <p>
                Radar readings published in 2024 confirmed that the pit opens into a cave at least forty meters wide, reaching tens of meters back into the dark. On the Moon, lower gravity lets such tubes grow far wider than any cave on Earth; the
                largest could in theory be wide enough to hold a small city. Nothing has been inside one, and the floors and walls are still as the lava left them.
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
                Reiner Gamma looks like a splash of bright paint across the dark plains of the Moon's Oceanus Procellarum. Early observers took it for high ground, until they realized it casts no shadow, which meant it was completely flat. It's now
                classified as a lunar swirl: a sweeping, highly reflective loop of brighter material that stands out against the darker soil around it.
              </p>
              <p>
                Modern data shows that every swirl sits atop a localized magnetic anomaly, a patch where the crust is unusually magnetized. That supports the leading theory, that the field acts like a sunscreen against the solar wind. This steady
                stream of particles from the Sun slowly darkens bare lunar soil over millions of years, but the magnetic bubble deflects it away. By this reading, the swirl isn't new material added to the surface. It may be the Moon's original
                brightness, preserved.
              </p>
              <p>
                This solar wind hypothesis is the leading explanation, not a settled one. A passing comet's gas, or dust sorted by the magnetism, could also draw the loops. NASA's Lunar Vertex mission is planned to land instruments directly inside
                Reiner Gamma, which would be the first measurements of a lunar swirl taken from the ground.
              </p>
            </Prose>
          </div>
          <LunarSwirlScene />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ch6-halves-heading">
        <div className={`${styles.sectionContent} ${styles.sectionContentFlow}`}>
          <div className={styles.textColumn}>
            <div className={styles.sectionHeader}>
              <h3 id="ch6-halves-heading" className={styles.sectionTitle}>
                Two halves that don&apos;t match
              </h3>
            </div>
            <Prose flush className={styles.copyBlock}>
              <p>
                The Moon&apos;s rotation is perfectly synced with its orbit around Earth. Because it takes the same amount of time to turn on its axis as it does to complete one orbit, the same side always faces us, and we never see the
                &ldquo;back&rdquo; of it. This hidden hemisphere remained unseen until October 1959, when the Soviet Union&apos;s Luna 3 spacecraft flew around the far side and sent back the first photographs of it, showing a landscape no one
                expected.
              </p>
              <div className={styles.figurePair}>
                <ChapterFigure credit={moonNearSideCredit} />
                <ChapterFigure credit={moonFarSideCredit} />
              </div>
              <p>
                The face we see from Earth is mottled with wide dark plains formed by ancient lava. The far side has almost none of them: it is rougher, paler, more crowded with craters, with a crust that runs on average tens of kilometers thicker
                than the side facing Earth. Deep inside, the two halves are just as mismatched; the near side is strangely warmer and packed with radioactive elements that seem missing from the far side.
              </p>
              <p>
                For a body so small and so close to spherical, there is no clear reason for the two halves to differ this much. Despite decades of study, scientists have yet to reach a single consensus, though several theories have been proposed:
              </p>
              <ul>
                <li>
                  <b>The &ldquo;Big Splat&rdquo; Theory</b>: A smaller, secondary moon once coexisted with ours before eventually colliding with the far side, leaving behind a thick layer of new crust.
                </li>
                <li>
                  <b>The Earthshine Theory</b>: Earth&apos;s early heat acted like a lamp: a molten Earth warmed the near side and kept it liquid, while the shielded far side cooled quickly and formed a thicker crust first.
                </li>
                <li>
                  <b>Internal Warming Hypotheses</b>: The Moon warmed up unevenly from the inside out, trapping hot, active magma under the near side while the far side quickly went cold and rigid.
                </li>
              </ul>
            </Prose>
          </div>
        </div>
      </section>
    </>
  );
}
