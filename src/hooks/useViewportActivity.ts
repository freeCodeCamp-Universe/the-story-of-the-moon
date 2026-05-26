import { useEffect, useRef, useState } from 'react';

type Options = {
  rootMargin?: string;
  threshold?: number | number[];
};

export function useViewportActivity<T extends Element>({ rootMargin = '0px', threshold = 0 }: Options = {}) {
  const targetRef = useRef<T | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(typeof IntersectionObserver === 'undefined');
  const [isDocumentVisible, setIsDocumentVisible] = useState(() => {
    if (typeof document === 'undefined') {
      return true;
    }

    return !document.hidden;
  });

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const updateVisibility = () => {
      setIsDocumentVisible(!document.hidden);
    };

    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);

    return () => {
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      return;
    }

    const target = targetRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNearViewport(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  return {
    targetRef,
    isNearViewport,
    isVisible: isNearViewport && isDocumentVisible,
  };
}
