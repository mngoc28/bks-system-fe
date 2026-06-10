import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const SCROLL_PREFIX = "bks_scroll_";

const savePos = (path: string) => {
  try {
    sessionStorage.setItem(SCROLL_PREFIX + path, String(window.scrollY));
  } catch {
    // Ignore storage exceptions (e.g. cookies blocked or private browsing mode)
  }
};

const loadPos = (path: string): number | null => {
  try {
    const v = sessionStorage.getItem(SCROLL_PREFIX + path);
    return v !== null ? Number(v) : null;
  } catch {
    return null;
  }
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const prevPathnameRef = useRef<string | null>(null);

  // Disable browser's built-in scroll restoration (it fires too early, before async content loads)
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  // Save scroll position whenever pathname changes (user is leaving this route)
  useEffect(() => {
    return () => {
      savePos(pathname);
    };
  }, [pathname]);

  useLayoutEffect(() => {
    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    if (prevPathname === pathname) {
      return;
    }

    if (navigationType === "POP") {
      const target = loadPos(pathname);
      if (target === null || target === 0) return;

      // Poll until the page is tall enough to scroll to target position.
      // This handles async content (data fetching) that makes the page grow after initial render.
      let attempts = 0;
      const MAX_ATTEMPTS = 40; // up to ~2 seconds

      const tryRestore = () => {
        const pageHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;

        if (pageHeight - viewportHeight >= target || attempts >= MAX_ATTEMPTS) {
          window.scrollTo({ top: target, behavior: "instant" as any });
        } else {
          attempts++;
          requestAnimationFrame(tryRestore);
        }
      };

      requestAnimationFrame(tryRestore);
    } else {
      // PUSH / REPLACE → scroll to top
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as any });
    }
  }, [pathname, navigationType]);

  return null;
};

export default ScrollToTop;

