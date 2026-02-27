import { useState, useRef, useCallback, ReactNode } from "react";

interface PullToRefreshProps {
  children: ReactNode;
  className?: string;
}

const PullToRefresh = ({ children, className = "" }: PullToRefreshProps) => {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // Only allow pull-to-refresh when scrolled to top AND touch starts in top 100px of screen
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const rootEl = document.getElementById('root');
    const rootScrollTop = rootEl ? rootEl.scrollTop : 0;
    const touchY = e.touches[0].clientY;

    if (scrollTop <= 0 && rootScrollTop <= 0 && touchY < 120) {
      startY.current = touchY;
      setPulling(true);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.4, 80));
    }
  }, [pulling]);

  const onTouchEnd = useCallback(() => {
    if (pullDistance > 60) {
      setRefreshing(true);
      setTimeout(() => window.location.reload(), 600);
    }
    setPulling(false);
    setPullDistance(0);
  }, [pullDistance]);

  return (
    <div
      ref={containerRef}
      className={className}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {(pullDistance > 0 || refreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: refreshing ? 48 : pullDistance }}
        >
          <div
            className={`w-5 h-5 border-2 border-primary border-t-transparent rounded-full ${refreshing ? "animate-spin" : ""}`}
            style={{ transform: refreshing ? undefined : `rotate(${pullDistance * 4}deg)` }}
          />
        </div>
      )}
      {children}
    </div>
  );
};

export default PullToRefresh;
