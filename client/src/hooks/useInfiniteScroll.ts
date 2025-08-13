import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  onIntersect: () => void;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

/**
 * Hook for implementing infinite scroll with Intersection Observer
 * @param options Configuration options
 * @returns Ref to attach to trigger element
 */
export function useInfiniteScroll({
  onIntersect,
  threshold = 0.1,
  rootMargin = "200px",
  enabled = true,
}: UseInfiniteScrollOptions) {
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && enabled) {
        onIntersect();
      }
    },
    [onIntersect, enabled]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    observerRef.current = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersect, threshold, rootMargin, enabled]);

  return elementRef;
}