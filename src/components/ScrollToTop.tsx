import { useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const SCROLL_KEY = "lamha_scroll_positions";
const RESTORE_TIMEOUT_MS = 3000;

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
  const cleanupRestoreRef = useRef<(() => void) | null>(null);

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
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    cleanupRestoreRef.current?.();
    cleanupRestoreRef.current = null;

    const prev = prevPathRef.current;
    prevPathRef.current = pathname;

    if (navType === "POP") {
      // Back/forward navigation — restore saved position
      const pos = getPositions();
      const saved = pos[pathname];
      if (saved != null && saved > 0) {
        restoringRef.current = true;
        const startedAt = Date.now();
        let settledFrames = 0;
        let rafId = 0;
        let intervalId = 0;

        const finishRestore = () => {
          if (rafId) cancelAnimationFrame(rafId);
          if (intervalId) window.clearInterval(intervalId);
          resizeObserver.disconnect();
          mutationObserver.disconnect();
          restoringRef.current = false;
          cleanupRestoreRef.current = null;
        };

        const tryRestore = () => {
          const maxScroll = Math.max(
            0,
            document.documentElement.scrollHeight - window.innerHeight
          );
          const target = Math.min(saved, maxScroll);

          window.scrollTo(0, target);

          const canReachSaved = maxScroll >= saved - 4;
          const closeEnough = Math.abs(window.scrollY - target) <= 4;

          if (canReachSaved && closeEnough) {
            settledFrames += 1;
          } else {
            settledFrames = 0;
          }

          if (settledFrames >= 2 || Date.now() - startedAt > RESTORE_TIMEOUT_MS) {
            finishRestore();
          }
        };

        const scheduleRestore = () => {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(tryRestore);
        };

        const resizeObserver = new ResizeObserver(scheduleRestore);
        const mutationObserver = new MutationObserver(scheduleRestore);
        const root = document.getElementById("root");

        resizeObserver.observe(document.documentElement);
        if (document.body) resizeObserver.observe(document.body);
        mutationObserver.observe(root ?? document.body, {
          childList: true,
          subtree: true,
        });

        intervalId = window.setInterval(scheduleRestore, 120);
        scheduleRestore();
        cleanupRestoreRef.current = finishRestore;

        return;
      }
    }

    // New navigation — scroll to top
    window.scrollTo(0, 0);
    const root = document.getElementById("root");
    if (root) root.scrollTop = 0;
    return () => {
      cleanupRestoreRef.current?.();
      cleanupRestoreRef.current = null;
    };
  }, [pathname, navType]);

  return null;
};

export default ScrollToTop;
