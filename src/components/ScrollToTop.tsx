import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const SCROLL_KEY = "lamha_scroll_positions";

const ScrollToTop = () => {
  const { pathname, key } = useLocation();
  const navType = useNavigationType();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // Save scroll position of the page we're leaving
    const prevPath = prevPathRef.current;
    if (prevPath !== pathname) {
      const positions = JSON.parse(sessionStorage.getItem(SCROLL_KEY) || "{}");
      positions[prevPath] = window.scrollY || document.documentElement.scrollTop || 0;
      sessionStorage.setItem(SCROLL_KEY, JSON.stringify(positions));
      prevPathRef.current = pathname;
    }

    // On POP (back/forward), restore saved position; otherwise scroll to top
    if (navType === "POP") {
      const positions = JSON.parse(sessionStorage.getItem(SCROLL_KEY) || "{}");
      const saved = positions[pathname];
      if (saved != null) {
        // Use requestAnimationFrame to wait for render
        requestAnimationFrame(() => {
          setTimeout(() => {
            window.scrollTo(0, saved);
          }, 50);
        });
        return;
      }
    }

    window.scrollTo(0, 0);
    const root = document.getElementById("root");
    if (root) root.scrollTop = 0;
  }, [pathname, navType]);

  return null;
};

export default ScrollToTop;
