import { useState, useRef, useCallback, useMemo } from 'react';

interface UseVirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  itemCount: number;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}

interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  totalHeight: number;
  visibleItems: number[];
}

export const useVirtualScroll = ({
  itemHeight,
  containerHeight,
  overscan = 5,
  itemCount,
}: UseVirtualScrollOptions): VirtualScrollResult => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { startIndex, endIndex } = useMemo(() => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, itemCount]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  const totalHeight = itemCount * itemHeight;
  const visibleItems = Array.from(
    { length: endIndex - startIndex + 1 },
    (_, i) => startIndex + i
  );

  return {
    startIndex,
    endIndex,
    containerRef,
    handleScroll,
    totalHeight,
    visibleItems,
  };
};
