import { useEffect, useRef, useState } from "react";

export const useTableScroll = (dependencies: unknown[] = []) => {
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);

  const checkScrollability = () => {
    if (tableScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableScrollRef.current;
      const needsScroll = scrollWidth > clientWidth;
      setHasScroll(needsScroll);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const handleScrollLeft = () => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollBy({ left: -50, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollBy({ left: 50, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollability();
    const scrollContainer = tableScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, dependencies);

  return {
    tableScrollRef,
    canScrollLeft,
    canScrollRight,
    hasScroll,
    handleScrollLeft,
    handleScrollRight,
  };
};

