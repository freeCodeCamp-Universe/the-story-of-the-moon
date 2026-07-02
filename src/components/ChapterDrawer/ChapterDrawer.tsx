import { useEffect, useRef } from 'react';
import { Drawer } from '@/components/Drawer/Drawer';
import { CHAPTERS } from '@/data/chapters';
import styles from './ChapterDrawer.module.css';

type Props = {
  isOpen: boolean;
  activeChapterId: string;
  activeSectionId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onSelectSection: (sectionId: string) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
};

export function ChapterDrawer({
  isOpen,
  activeChapterId,
  activeSectionId,
  onSelectChapter,
  onSelectSection,
  onClose,
  triggerRef,
}: Props) {
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  // Bring the highlighted row into view within the drawer's own scroll area
  // when it opens, without stealing focus from the close button.
  useEffect(() => {
    if (isOpen) {
      activeItemRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      triggerRef={triggerRef}
      id="chapter-drawer"
      titleId="chapter-drawer-title"
      title="Chapters"
      closeLabel="close chapter list"
    >
      <ol className={styles.list}>
        {/* The section tracker reports the last heading scrolled past, which
            lingers on a previous chapter's subsection after you move on. Honor
            the active section only while its own chapter is the active chapter,
            so the caret follows the reader instead of sticking. When a section
            is active, no chapter row carries the caret. */}
        {(() => {
          const activeSectionOwnerId = activeSectionId
            ? (CHAPTERS.find((chapter) =>
                chapter.sections.some(
                  (section) => section.id === activeSectionId
                )
              )?.id ?? null)
            : null;
          const currentSectionId =
            activeSectionOwnerId === activeChapterId ? activeSectionId : null;

          return CHAPTERS.map((chapter) => {
            const markChapter =
              chapter.id === activeChapterId && currentSectionId === null;

            return (
              <li key={chapter.id}>
                <button
                  ref={markChapter ? activeItemRef : undefined}
                  type="button"
                  className={`${styles.item} ${styles.chapterItem}${markChapter ? ` ${styles.itemActive}` : ''}`}
                  aria-current={markChapter ? 'true' : undefined}
                  onClick={() => onSelectChapter(chapter.id)}
                >
                  {chapter.index}. {chapter.title}
                </button>

                {chapter.sections.length > 0 && (
                  <ul className={styles.sectionList}>
                    {chapter.sections.map((section) => {
                      const isSectionActive = section.id === currentSectionId;

                      return (
                        <li key={section.id}>
                          <button
                            ref={isSectionActive ? activeItemRef : undefined}
                            type="button"
                            className={`${styles.item} ${styles.sectionItem}${isSectionActive ? ` ${styles.itemActive}` : ''}`}
                            aria-current={isSectionActive ? 'true' : undefined}
                            onClick={() => onSelectSection(section.id)}
                          >
                            {section.title}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          });
        })()}
      </ol>
    </Drawer>
  );
}
