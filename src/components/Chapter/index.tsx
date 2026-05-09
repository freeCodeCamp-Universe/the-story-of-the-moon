import type { ReactNode } from 'react';
import styles from './Chapter.module.css';

type Props = {
  id: string;
  question: string;
  title: string;
  children: ReactNode;
};

export default function Chapter({ id, question, title, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={styles.section}>
      <header className={styles.header}>
        <span className={styles.question}>{question}</span>
        <h2 id={`${id}-heading`} className={styles.heading}>
          {title}
        </h2>
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
