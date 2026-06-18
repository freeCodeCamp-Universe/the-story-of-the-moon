import React, { type ComponentPropsWithoutRef } from 'react';
import styles from './IconButton.module.css';

type Props = ComponentPropsWithoutRef<'button'> & {
  active?: boolean;
  'aria-label': string;
};

export const IconButton = React.forwardRef<HTMLButtonElement, Props>(function IconButton({ active = false, className, type = 'button', children, ...buttonProps }, ref) {
  const mergedClassName = [styles.iconButton, active && styles.active, className].filter(Boolean).join(' ');

  return (
    <button {...buttonProps} ref={ref} type={type} className={mergedClassName}>
      {children}
    </button>
  );
});
