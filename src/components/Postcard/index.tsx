import type { PostcardData } from '@/types/content';
import { getAsset } from '@/content';
import styles from './Postcard.module.css';

type Props = {
  postcard: PostcardData;
};

export default function Postcard({ postcard }: Props) {
  const credit = getAsset(postcard.image.creditId);
  const imageClassName = postcard.id === 'bootprint' ? `${styles.image} ${styles.bootprintImage}` : styles.image;

  return (
    <figure className={styles.container}>
      <img className={imageClassName} src={postcard.image.src} alt={postcard.image.alt} />
      <figcaption className={styles.caption}>
        {postcard.caption && <span className={styles.captionText}>{postcard.caption}</span>}
        {credit && <span className={styles.captionCredit}>{credit.attributionText}</span>}
      </figcaption>
    </figure>
  );
}
