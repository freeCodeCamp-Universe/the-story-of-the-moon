import styles from './Ch7.module.css';

export default function Ch7() {
  return (
    <>
      <div className={styles.prose}>
        <p className={styles.paragraph}>
          The Moon is the oldest clock humans have used. Long before writing, long before farming, long before anyone tracked years, the cycle from full to new and back was something anyone could count: twenty-nine and a half days.
        </p>
        <p className={styles.paragraph}>
          It's one of the few constants in the human experience. Every generation of people has looked up at the same Moon. It's a timeless witness to our story, watching over us just as it did the very first of our kind.
        </p>
        <p className={styles.paragraph}>It's a sobering reminder of our own brevity. We are merely passing through a landscape that the Moon has known intimately for four billion years.</p>
      </div>
      <p className={styles.endMarker}>
        <span aria-hidden="true">&gt;</span> end of transmission
      </p>
    </>
  );
}
