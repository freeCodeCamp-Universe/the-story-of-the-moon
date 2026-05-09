import { useEffect, useState } from 'react';
import Ch1 from '@/chapters/Ch1';
import Ch2 from '@/chapters/Ch2';
import Ch3 from '@/chapters/Ch3';
import Ch4 from '@/chapters/Ch4';
import Ch5 from '@/chapters/Ch5';
import Ch6 from '@/chapters/Ch6';
import Ch7 from '@/chapters/Ch7';
import Chapter from '@/components/Chapter';
import MoonInterlude from '@/components/MoonInterlude';
import NavStrip from '@/components/NavStrip';
import Postcard from '@/components/Postcard';
import { postcards } from '@/content';
import { CHAPTERS } from '@/data/chapters';
import { useChapterFragmentSync } from '@/hooks/useChapterFragmentSync';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import styles from './StoryPage.module.css';

export default function StoryPage() {
  const [activeChapterId, setActiveChapterId] = useState('chapter-1');

  useChapterFragmentSync(setActiveChapterId);
  useKeyboardNav();

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('chapter-')) {
        setActiveChapterId(hash);
      }
    };

    window.addEventListener('hashchange', onHashChange);

    const initial = window.location.hash.replace('#', '');
    if (initial.startsWith('chapter-')) {
      setActiveChapterId(initial);
    }

    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function handleNavigate(chapterId: string) {
    setActiveChapterId(chapterId);
  }

  const moonDiscPostcard = postcards.find((postcard) => postcard.id === 'moon-disc');
  const eclipsePostcard = postcards.find((postcard) => postcard.id === 'eclipse');
  const bootprintPostcard = postcards.find((postcard) => postcard.id === 'bootprint');

  return (
    <>
      <a href="#main" className="sr-only">
        Skip to main content
      </a>
      <NavStrip activeChapterId={activeChapterId} onNavigate={handleNavigate} />
      <main id="main" tabIndex={-1} className={styles.main}>
        <Chapter id="chapter-1" question={CHAPTERS[0].question} title={CHAPTERS[0].title}>
          <Ch1 />
        </Chapter>

        {moonDiscPostcard && <Postcard postcard={moonDiscPostcard} />}

        <Chapter id="chapter-2" question={CHAPTERS[1].question} title={CHAPTERS[1].title}>
          <Ch2 />
        </Chapter>

        {eclipsePostcard && <Postcard postcard={eclipsePostcard} />}

        <Chapter id="chapter-3" question={CHAPTERS[2].question} title={CHAPTERS[2].title}>
          <Ch3 />
        </Chapter>

        {bootprintPostcard && <Postcard postcard={bootprintPostcard} />}

        <Chapter id="chapter-4" question={CHAPTERS[3].question} title={CHAPTERS[3].title}>
          <Ch4 />
        </Chapter>

        <Chapter id="chapter-5" question={CHAPTERS[4].question} title={CHAPTERS[4].title}>
          <Ch5 />
        </Chapter>

        <Chapter id="chapter-6" question={CHAPTERS[5].question} title={CHAPTERS[5].title}>
          <Ch6 />
        </Chapter>

        <MoonInterlude />

        <Chapter id="chapter-7" question={CHAPTERS[6].question} title={CHAPTERS[6].title}>
          <Ch7 />
        </Chapter>
      </main>
    </>
  );
}
