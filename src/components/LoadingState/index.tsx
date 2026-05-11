import styles from './LoadingState.module.css';

// Circumference of the arc circle: 2π × 22 ≈ 138.23
// Arc covers ~75 % of the circumference (~103.67), gap fills the rest (~34.56).
const ARC_DASHARRAY = '103.67 34.56';

export default function LoadingState() {
  return (
    <div className={styles.container} role="status">
      <svg
        className={styles.spinner}
        viewBox="0 0 56 56"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className={styles.baseRing}
          cx="28"
          cy="28"
          r="22"
          fill="none"
          strokeWidth="6"
        />
        <circle
          className={styles.arc}
          cx="28"
          cy="28"
          r="22"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={ARC_DASHARRAY}
        />
      </svg>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
