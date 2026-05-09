import { useEffect, useId, useRef, useState } from 'react';

import CreditCaption from '@/components/CreditCaption';
import { getAsset } from '@/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';

import styles from './Ch6.module.css';

type ChapterCard = {
  title: string;
  assetId: string;
  body: string[];
};

const CARDS: ChapterCard[] = [
  {
    title: 'Floors in permanent shadow',
    assetId: 'erlanger-crater',
    body: [
      "Near the Moon's poles, the floors of some craters have stayed in darkness for around two billion years, because the Sun never quite lifts above the rim.",
      'With no sunlight to warm them, the deepest of these floors sit close to minus 240 degrees Celsius, among the coldest places measured anywhere in the solar system. Anything that has fallen into them, whether comet fragments, asteroid dust, or particles carried in by the solar wind, has had nowhere to go and is still there.',
      'From orbit, instruments have detected water ice on the surface and measured the rough shape and temperature. But nothing has reached the floor of one.',
    ],
  },
  {
    title: 'Tunnels under the surface',
    assetId: 'tranquillitatis-pit',
    body: [
      'In a few places on the Moon, the ground opens. One of the larger such openings sits on the Sea of Tranquillity: a roughly circular pit about a hundred meters across, with the floor visible through the gap.',
      "It isn't a crater but the collapsed roof of a tunnel. When the dark plains of the Moon were young, lava flowed across them in long sheets, and the top of a flow would cool and crust over while fresh lava kept moving underneath. Once the source ran dry, the molten rock drained out, leaving an empty channel behind.",
      "Radar readings published in 2024 traced one such channel about forty-five meters in from the Tranquillity pit's opening, into the dark. The Moon's lower gravity allows a tube like this to grow far wider than anything caves on Earth can manage, in some estimates wide enough to hold a small city. Nothing has been inside one, and the floors and walls are still as the lava left them.",
    ],
  },
  {
    title: "Two halves that don't match",
    assetId: 'moon-nearside-farside',
    body: [
      'The Moon has two halves, and from any rooftop on Earth you have only ever seen one of them, because the same face always points toward us. Until 1959, no human had seen the other side, and when the first photographs of it returned that year, they showed a Moon that almost no one had expected.',
      'The face we see from Earth is mottled with wide dark plains formed by ancient lava. The far side has almost none of them: it is rougher, paler, more crowded with craters, with a crust that runs on average tens of kilometers thicker than the side facing Earth. Deep inside, the two halves are just as mismatched; the near side is strangely warmer and packed with radioactive elements that seem missing from the far side.',
      'For a body so small and so close to spherical, there is no clear reason for the two halves to differ this much. One proposal is that a smaller second moon, formed alongside ours, eventually fell into the far side and added a thick layer of new crust to it. Other theories suggest the uneven heat distribution itself shaped the two faces differently, but despite decades of study, no single explanation has been agreed on.',
    ],
  },
];

function useDesktopChapterLayout(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(min-width: 768px)').matches);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isDesktop;
}

export default function Ch6() {
  const chapterId = useId();
  const reducedMotion = useReducedMotion();
  const isDesktop = useDesktopChapterLayout();
  const shouldStack = isDesktop && !reducedMotion;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const trackRailRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const cards = cardRefs.current;

    if (!shouldStack) {
      cards.forEach((card) => {
        if (!card) {
          return;
        }

        card.style.removeProperty('transform');
        card.style.removeProperty('opacity');
      });
      return;
    }

    let frameId = 0;

    const scheduleUpdate = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        const stage = stageRef.current;
        const trackRail = trackRailRef.current;
        const viewportHeight = window.innerHeight || 1;

        if (!stage || !trackRail || cards.length === 0) {
          return;
        }

        const stageTop = stage.getBoundingClientRect().top;
        const stageHeight = stage.getBoundingClientRect().height;
        const trackRailTop = trackRail.getBoundingClientRect().top;
        const progressStart = trackRailTop - stageHeight;
        const progress = Math.max(0, Math.min(cards.length, (stageTop - progressStart) / viewportHeight));
        const titleBand = cards[0]?.querySelector(`.${styles.titleBand}`) as HTMLElement | null;
        const cardHeight = cards[0]?.getBoundingClientRect().height ?? viewportHeight * 0.8;
        const titleOffset = titleBand?.getBoundingClientRect().height ?? 56;
        const releaseProgress = Math.max(0, Math.min(1, progress - (cards.length - 1)));
        const viewportEntryY = Math.max(cardHeight, viewportHeight - stageTop + titleOffset);

        cards.forEach((card, index) => {
          if (!card) {
            return;
          }

          const entryProgress = index === 0 ? 1 : Math.max(0, Math.min(1, progress - (index - 1)));
          const startY = index === 0 ? 0 : viewportEntryY;
          const stackedY = index * titleOffset;
          const translateY = startY + (stackedY - startY) * entryProgress - releaseProgress * cardHeight;

          card.style.transform = `translate3d(0, ${translateY}px, 0)`;
        });

        cards.forEach((card, index) => {
          if (!card) {
            return;
          }

          card.style.zIndex = String(index + 1);
        });
      });
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);

      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [shouldStack]);

  return (
    <div className={shouldStack ? styles.stack : styles.flow}>
      <div className={styles.intro}>
        <p>For thousands of years, our nearest neighbor in space has been watched, sketched, mapped, and photographed in fine detail, and yet there are still parts of it nobody has been to and features of it nobody has fully explained.</p>
      </div>
      {shouldStack ? (
        <div className={styles.stackShell}>
          <div ref={stageRef} className={styles.stackStage}>
            {CARDS.map((card, index) => {
              const credit = getAsset(card.assetId);

              if (!credit) {
                return null;
              }

              const titleId = `${chapterId}-card-${index}`;

              return (
                <article
                  key={card.assetId}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  className={[styles.card, styles.stackCard].join(' ')}
                  aria-labelledby={titleId}
                >
                  <div className={styles.titleBand}>
                    <h3 id={titleId} className={styles.cardTitle}>
                      {card.title}
                    </h3>
                  </div>
                  <div className={styles.contentRow}>
                    <div className={styles.cardBody}>
                      {card.body.map((paragraph) => (
                        <p key={paragraph} className={styles.paragraph}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    <figure className={styles.figure}>
                      <div className={styles.photoFrame}>
                        <img className={styles.figureImage} src={`/${credit.file}`} alt={credit.alt} loading="lazy" />
                      </div>
                      <CreditCaption credit={credit} />
                    </figure>
                  </div>
                </article>
              );
            })}
          </div>

          <div ref={trackRailRef} className={styles.trackRail} aria-hidden="true">
            {CARDS.map((card) => (
              <div key={`${card.assetId}-track`} className={styles.releaseTrack} />
            ))}
          </div>
        </div>
      ) : (
        CARDS.map((card, index) => {
          const credit = getAsset(card.assetId);

          if (!credit) {
            return null;
          }

          const titleId = `${chapterId}-card-${index}`;

          return (
            <div key={card.assetId} className={styles.flowTrack}>
              <article className={styles.card} aria-labelledby={titleId}>
                <div className={styles.titleBand}>
                  <h3 id={titleId} className={styles.cardTitle}>
                    {card.title}
                  </h3>
                </div>
                <div className={styles.contentRow}>
                  <div className={styles.cardBody}>
                    {card.body.map((paragraph) => (
                      <p key={paragraph} className={styles.paragraph}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <figure className={styles.figure}>
                    <div className={styles.photoFrame}>
                      <img className={styles.figureImage} src={`/${credit.file}`} alt={credit.alt} loading="lazy" />
                    </div>
                    <CreditCaption credit={credit} />
                  </figure>
                </div>
              </article>
            </div>
          );
        })
      )}
    </div>
  );
}
