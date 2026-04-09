import { useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const SCROLL_KEY = "lamha_scroll_positions";

const getPositions = (): Record<string, number> => {
  try {
    return JSON.parse(sessionStorage.getItem(SCROLL_KEY) || "{}");
  } catch {
    return {};
  }
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  const prevPathRef = useRef(pathname);
  const restoringRef = useRef(false);

  // Continuously save scroll position for current path on every scroll
  const handleScroll = useCallback(() => {
    if (restoringRef.current) return;
    const pos = getPositions();
    pos[prevPathRef.current] = window.scrollY || 0;
    try {
      sessionStorage.setItem(SCROLL_KEY, JSON.stringify(pos));
    } catch {}
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;

    if (navType === "POP") {
      // Back/forward navigation — restore saved position
      const pos = getPositions();
      const saved = pos[pathname];
      if (saved != null && saved > 0) {
        restoringRef.current = true;
        // Wait for content to render before restoring
        const tryRestore = (attempts: number) => {
          window.scrollTo(0, saved);
          if (attempts < 5 && Math.abs(window.scrollY - saved) > 10) {
            requestAnimationFrame(() =>
              setTimeout(() => tryRestore(attempts + 1), 60)
            );
          } else {
            restoringRef.current = false;
          }
        };
        requestAnimationFrame(() => setTimeout(() => tryRestore(0), 30));
        return;
      }
    }

    // New navigation — scroll to top
    window.scrollTo(0, 0);
    const root = document.getElementById("root");
    if (root) root.scrollTop = 0;
  }, [pathname, navType]);

  return null;
};

export default ScrollToTop;
