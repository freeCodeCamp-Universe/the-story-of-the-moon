import styles from './Switch.module.css';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Whether the visible label sits before or after the toggle. */
  labelPosition?: 'start' | 'end';
  /** Forwarded to the wrapping label so a parent layout can position the control. */
  className?: string;
};

export function Switch({ checked, onChange, label, labelPosition = 'end', className }: Props) {
  const classNames = [styles.switch, className].filter(Boolean).join(' ');
  const labelText = <span className={styles.label}>{label}</span>;

  return (
    <label className={classNames}>
      {labelPosition === 'start' ? labelText : null}
      <input className={styles.input} type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
      {labelPosition === 'end' ? labelText : null}
    </label>
  );
}
