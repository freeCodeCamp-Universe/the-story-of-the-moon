import CreditCaption from "@/components/CreditCaption";
import OptimizedImage from "@/components/OptimizedImage";
import { getAsset } from "@/content";
import type { AssetCredit } from "@/types/content";

import styles from "./Ch6.module.css";

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
  const erlangerCredit = getAsset("erlanger-crater");
  const tranquillitatisCredit = getAsset("tranquillitatis-pit");
  const moonNearSideCredit = getAsset("moon-near-side");
  const moonFarSideCredit = getAsset("moon-far-side");

  return (
    <>
      <div className={styles.intro}>
        <p>
          For thousands of years, our nearest neighbor in space has been
          watched, sketched, mapped, and photographed in fine detail, and yet
          there are still parts of it nobody has been to and features of it
          nobody has fully explained.
        </p>
      </div>

      <section className={styles.section} aria-labelledby="ch6-shadow-heading">
        <div className={styles.sectionContent}>
          <div className={styles.textColumn}>
            <div className={styles.sectionHeader}>
              <h3 id="ch6-shadow-heading" className={styles.sectionTitle}>
                Floors in permanent shadow
              </h3>
            </div>
            <div className={styles.copyBlock}>
              <p>
                Near the Moon&apos;s poles, the floors of some craters have
                stayed in darkness for around two billion years, because the Sun
                never quite lifts above the rim.
              </p>
              <p>
                With no sunlight to warm them, the deepest of these floors sit
                close to minus 240 degrees Celsius, among the coldest places
                measured anywhere in the solar system. Anything that has fallen
                into them, whether comet fragments, asteroid dust, or particles
                carried in by the solar wind, has had nowhere to go and is still
                there.
              </p>
              <p>
                From orbit, instruments have detected water ice on the surface
                and measured the rough shape and temperature. But nothing has
                reached the floor of one.
              </p>
            </div>
          </div>
          <ChapterFigure credit={erlangerCredit} />
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
            <div className={styles.copyBlock}>
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
                Radar readings published in 2024 traced one such channel about
                forty-five meters in from the Tranquillity pit&apos;s opening,
                into the dark. The Moon&apos;s lower gravity allows a tube like
                this to grow far wider than anything caves on Earth can manage,
                in some estimates wide enough to hold a small city. Nothing has
                been inside one, and the floors and walls are still as the lava
                left them.
              </p>
            </div>
          </div>
          <ChapterFigure credit={tranquillitatisCredit} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ch6-halves-heading">
        <div className={styles.sectionContent}>
          <div className={styles.textColumn}>
            <div className={styles.sectionHeader}>
              <h3 id="ch6-halves-heading" className={styles.sectionTitle}>
                Two halves that don&apos;t match
              </h3>
            </div>
            <div className={styles.copyBlock}>
              <p>
                The Moon’s rotation is perfectly synced with its orbit around
                Earth. Because it takes the same amount of time to turn on its
                axis as it does to complete one orbit, the same side always
                faces us, and we never see the "back" of it. This hidden
                hemisphere remained unseen until October 1959, when the Soviet
                Union's Luna 3 spacecraft orbited the Moon and captured
                history's first photographs of the region, revealing a landscape
                that defied expectations.
              </p>
              <p>
                The face we see from Earth is mottled with wide dark plains
                formed by ancient lava. The far side has almost none of them: it
                is rougher, paler, more crowded with craters, with a crust that
                runs on average tens of kilometers thicker than the side facing
                Earth. Deep inside, the two halves are just as mismatched; the
                near side is strangely warmer and packed with radioactive
                elements that seem missing from the far side.
              </p>
              <p>
                For a body so small and so close to spherical, there is no clear
                reason for the two halves to differ this much. Despite decades
                of study, scientists have yet to reach a single consensus,
                though several compelling theories exist:
              </p>
              <ul>
                <li>
                  <b>The "Big Splat" Theory</b>: A smaller, secondary moon once
                  coexisted with ours before eventually colliding with the far
                  side, leaving behind a thick layer of new crust.
                </li>
                <li>
                  <b>The Earthshine Theory</b>: Earth's early heat acted like a
                  lamp; a molten Earth baked the near side to keep it liquid,
                  while the shielded far side cooled quickly and formed a
                  thicker crust first.
                </li>
                <li>
                  <b>Internal Warming Hypotheses</b>: The Moon warmed up
                  unevenly from the inside out, trapping hot, active magma under
                  the near side while the far side quickly went cold and rigid.
                </li>
              </ul>
            </div>
          </div>
          <div className={styles.figureStack}>
            <ChapterFigure credit={moonNearSideCredit} />
            <ChapterFigure credit={moonFarSideCredit} />
          </div>
        </div>
      </section>
    </>
  );
}
