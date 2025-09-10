declare global {
  interface IntersectionObserverCallback {
    (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver
    ): void;
  }

  interface IntersectionObserverInit {
    root?: Element | Document | null;
    rootMargin?: string;
    threshold?: number | number[];
  }
}
