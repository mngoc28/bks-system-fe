import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Immediate scroll to top on route change before the browser paints
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
