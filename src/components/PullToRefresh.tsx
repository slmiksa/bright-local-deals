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
    if (window.scrollY <= 0) {
      startY.current = e.touches[0].clientY;
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
