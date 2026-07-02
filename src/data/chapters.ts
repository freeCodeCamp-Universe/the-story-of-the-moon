export type ChapterSection = {
  id: string;
  title: string;
};

export const CHAPTERS = [
  {
    id: 'chapter-1',
    index: 1,
    title: 'A violent beginning, perhaps',
    question: 'Where did the Moon come from?',
    sections: [],
  },
  {
    id: 'chapter-2',
    index: 2,
    title: 'A face written by impacts',
    question: 'Why does it look like that?',
    sections: [
      { id: 'ch2-crater-heading', title: 'Crater' },
      { id: 'ch2-basin-heading', title: 'Basin' },
      {
        id: 'ch2-surface-features-heading',
        title: 'Surface features of the Moon',
      },
    ],
  },
  {
    id: 'chapter-3',
    index: 3,
    title: 'A partner that steadies Earth',
    question: 'Why does the Moon matter to Earth?',
    sections: [
      { id: 'ch3-tides-heading', title: 'Tides' },
      { id: 'ch3-tilt-heading', title: 'Axial stabilization' },
      { id: 'ch3-wander-heading', title: 'Without the Moon' },
      { id: 'ch3-reflected-heading', title: 'Full moon' },
      { id: 'ch3-filtered-heading', title: 'Lunar eclipse' },
      { id: 'ch3-blocked-heading', title: 'Solar eclipse' },
    ],
  },
  {
    id: 'chapter-4',
    index: 4,
    title: 'Going to the Moon',
    question: 'Why did we go, and what brought us back?',
    sections: [
      { id: 'ch4-missions', title: 'NASA missions' },
      { id: 'diptych-title', title: 'The same horizon' },
    ],
  },
  {
    id: 'chapter-5',
    index: 5,
    title: 'What the rocks told us',
    question: 'What did the Apollo samples reveal?',
    sections: [
      { id: 'ch5-samples-heading', title: 'What came back' },
      { id: 'ch5-magma-ocean-heading', title: 'An ocean of molten rock' },
      { id: 'ch5-chemical-match-heading', title: 'A chemical match' },
    ],
  },
  {
    id: 'chapter-6',
    index: 6,
    title: "A neighbor we don't yet know",
    question: 'Why are we going back?',
    sections: [
      { id: 'ch6-shadow-heading', title: 'Floors in permanent shadow' },
      { id: 'ch6-water-heading', title: 'Water on the Moon' },
      { id: 'ch6-tunnels-heading', title: 'Tunnels under the surface' },
      { id: 'ch6-swirl-heading', title: 'Bright ground over buried magnets' },
      { id: 'ch6-halves-heading', title: "Two halves that don't match" },
    ],
  },
  {
    id: 'chapter-7',
    index: 7,
    title: 'A timeless observer',
    question: 'Where do we fit in its story?',
    sections: [],
  },
] as const;

export const CHAPTER_IDS: readonly string[] = CHAPTERS.map((c) => c.id);

export const SECTION_IDS: readonly string[] = CHAPTERS.flatMap((chapter) =>
  chapter.sections.map((section) => section.id)
);
