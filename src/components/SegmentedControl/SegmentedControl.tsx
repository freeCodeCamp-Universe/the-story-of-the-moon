import styles from './SegmentedControl.module.css';

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  /** Radio group name; must be unique on the page. */
  name: string;
  /** Accessible name for the radiogroup. */
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Forwarded to the wrapping radiogroup so a parent layout can position the control. */
  className?: string;
};

// A connected segmented strip backed by real radio inputs: one option is always
// selected, segments share a collapsed hairline, and the active segment lifts
// with an accent border plus surface fill. Used wherever a chapter figure needs
// a single-select view switcher (see PolarIceFigure, LunarSwirlScene).
export function SegmentedControl<T extends string>({ name, label, options, value, onChange, className }: Props<T>) {
  const classNames = [styles.group, className].filter(Boolean).join(' ');

  return (
    <div className={classNames} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <label key={option.value} className={styles.option}>
          <input className={styles.input} type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
          <span className={styles.button}>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
