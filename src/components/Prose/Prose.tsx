import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import styles from './Prose.module.css';

type ProseWidth = 'text' | 'wide' | 'frame' | 'full';

type ProseProps = {
  /** Content-width tier. Defaults to `text` (the reading column). Use
   * `full` for prose in a cell that already owns its width (e.g. a card
   * column): no measure cap, no centering, no gutter. */
  width?: ProseWidth;
  /** Measure cap only — drops the centering margin and side gutter. Use when a parent cell already owns the gutter. */
  flush?: boolean;
  /** Element to render. Defaults to `div`. */
  as?: ElementType;
  className?: string;
  children?: ReactNode;
};

const widthClass: Record<ProseWidth, string> = {
  text: '',
  wide: styles.wide,
  frame: styles.frame,
  full: styles.full,
};

export function Prose({ width = 'text', flush = false, as, className, children, ...rest }: ProseProps & Omit<ComponentPropsWithoutRef<ElementType>, keyof ProseProps>) {
  const Component = as ?? 'div';
  const classes = [styles.prose, widthClass[width], flush ? styles.flush : '', className].filter(Boolean).join(' ');

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
