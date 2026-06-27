import type { ReactNode } from 'react';

import styles from './Kbd.module.css';

type Props = {
  children: ReactNode;
  tone?: 'default' | 'muted';
  /**
   * Spoken label for keys whose glyph a screen reader would skip or mispronounce
   * (e.g. punctuation like `[` and `]`). The visible glyph is hidden from the
   * accessibility tree and this text is announced in its place. Ignored for the
   * arrow glyphs, which carry their own labels.
   */
  label?: string;
};

const arrowIconData = {
  '←': {
    viewBox: '0 0 640 640',
    path: 'M73.4 297.4C60.9 309.9 60.9 330.2 73.4 342.7L233.4 502.7C245.9 515.2 266.2 515.2 278.7 502.7C291.2 490.2 291.2 469.9 278.7 457.4L173.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L173.3 288L278.7 182.6C291.2 170.1 291.2 149.8 278.7 137.3C266.2 124.8 245.9 124.8 233.4 137.3L73.4 297.3z',
    label: 'Left arrow',
  },
  '→': {
    viewBox: '0 0 640 640',
    path: 'M566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3C348.8 149.8 348.8 170.1 361.3 182.6L466.7 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L466.7 352L361.3 457.4C348.8 469.9 348.8 490.2 361.3 502.7C373.8 515.2 394.1 515.2 406.6 502.7L566.6 342.7z',
    label: 'Right arrow',
  },
  '↑': {
    viewBox: '0 0 640 640',
    path: 'M342.6 73.4C330.1 60.9 309.8 60.9 297.3 73.4L137.3 233.4C124.8 245.9 124.8 266.2 137.3 278.7C149.8 291.2 170.1 291.2 182.6 278.7L288 173.3L288 544C288 561.7 302.3 576 320 576C337.7 576 352 561.7 352 544L352 173.3L457.4 278.7C469.9 291.2 490.2 291.2 502.7 278.7C515.2 266.2 515.2 245.9 502.7 233.4L342.7 73.4z',
    label: 'Up arrow',
  },
  '↓': {
    viewBox: '0 0 640 640',
    path: 'M297.4 566.6C309.9 579.1 330.2 579.1 342.7 566.6L502.7 406.6C515.2 394.1 515.2 373.8 502.7 361.3C490.2 348.8 469.9 348.8 457.4 361.3L352 466.7L352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 466.7L182.6 361.3C170.1 348.8 149.8 348.8 137.3 361.3C124.8 373.8 124.8 394.1 137.3 406.6L297.3 566.6z',
    label: 'Down arrow',
  },
} as const;

type ArrowGlyph = keyof typeof arrowIconData;

const fontAwesomeLicenseComment =
  '<!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->';

function ArrowIcon({ glyph }: { glyph: ArrowGlyph }) {
  const icon = arrowIconData[glyph];

  return (
    <svg
      className={styles.arrowIcon}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon.viewBox}
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{
        __html: `${fontAwesomeLicenseComment}<path d="${icon.path}" />`,
      }}
    />
  );
}

export function Kbd({ children, tone = 'default', label }: Props) {
  const className =
    tone === 'muted' ? `${styles.kbd} ${styles.muted}` : styles.kbd;
  const arrowGlyph =
    typeof children === 'string' && children in arrowIconData
      ? (children as ArrowGlyph)
      : null;

  if (arrowGlyph) {
    return (
      <kbd className={className}>
        <ArrowIcon glyph={arrowGlyph} />
        <span className="sr-only">{arrowIconData[arrowGlyph].label}</span>
      </kbd>
    );
  }

  if (label) {
    return (
      <kbd className={className}>
        <span aria-hidden="true">{children}</span>
        <span className="sr-only">{label}</span>
      </kbd>
    );
  }

  return <kbd className={className}>{children}</kbd>;
}
