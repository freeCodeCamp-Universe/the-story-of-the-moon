import type { ImgHTMLAttributes } from 'react';
import styles from './OptimizedImage.module.css';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & {
  src?: string;
};

const rasterSourcePattern = /\.(jpe?g|png)$/i;

function toWebpPath(src: string) {
  return src.replace(rasterSourcePattern, '.webp');
}

export default function OptimizedImage({ src, alt, className, decoding, loading, ...imgProps }: Props) {
  const resolvedDecoding = decoding ?? (loading === 'lazy' ? 'async' : 'auto');
  const pictureClassName = className ? `${styles.picture} ${className}` : styles.picture;

  const image = <img {...imgProps} className={styles.image} src={src} alt={alt} loading={loading} decoding={resolvedDecoding} />;

  if (!src || !rasterSourcePattern.test(src)) {
    return <img {...imgProps} className={className} src={src} alt={alt} loading={loading} decoding={resolvedDecoding} />;
  }

  return (
    <picture className={pictureClassName}>
      <source srcSet={toWebpPath(src)} type="image/webp" />
      {image}
    </picture>
  );
}
