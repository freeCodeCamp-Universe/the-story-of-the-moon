export const CHAPTERS = [
  {
    id: 'chapter-1',
    index: 1,
    title: 'A violent beginning, perhaps',
    question: 'Where did the Moon come from?',
  },
  {
    id: 'chapter-2',
    index: 2,
    title: 'A face written by impacts',
    question: 'Why does it look like that?',
  },
  {
    id: 'chapter-3',
    index: 3,
    title: 'A partner that steadies us',
    question: 'Why does the Moon matter to Earth?',
  },
  {
    id: 'chapter-4',
    index: 4,
    title: 'Going to the Moon',
    question: 'Why did we go, and what brought us back?',
  },
  {
    id: 'chapter-5',
    index: 5,
    title: 'What the rocks told us',
    question: 'What did the Apollo samples actually reveal?',
  },
  {
    id: 'chapter-6',
    index: 6,
    title: "A neighbor we don't yet know",
    question: 'Why are we going back?',
  },
  {
    id: 'chapter-7',
    index: 7,
    title: 'A timeless observer',
    question: 'Where do we fit in its story?',
  },
] as const;

export const CHAPTER_IDS: readonly string[] = CHAPTERS.map((c) => c.id);
