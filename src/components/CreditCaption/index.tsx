import type { AssetCredit } from '@/types/content';
import styles from './CreditCaption.module.css';

type Props = {
  credit: AssetCredit;
};

export default function CreditCaption({ credit }: Props) {
  return <p className={styles.caption}>{credit.attributionText}</p>;
}
