import { useState, useRef, useCallback, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

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
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const rootEl = document.getElementById('root');
    const rootScrollTop = rootEl ? rootEl.scrollTop : 0;
    const touchY = e.touches[0].clientY;

    if (scrollTop <= 0 && rootScrollTop <= 0 && touchY < 500) {
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

  const progress = Math.min(pullDistance / 60, 1);

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
          className="fixed left-0 right-0 z-[60] flex items-center justify-center max-w-[430px] mx-auto pointer-events-none"
          style={{
            top: 'calc(env(safe-area-inset-top, 0px) + 60px)',
            height: refreshing ? 48 : pullDistance,
            transition: refreshing ? 'height 0.3s ease' : undefined,
          }}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              refreshing
                ? "bg-primary/15 shadow-md shadow-primary/10"
                : "bg-primary/10"
            }`}
            style={{
              transform: `scale(${0.6 + progress * 0.4})`,
              opacity: 0.4 + progress * 0.6,
            }}
          >
            <RefreshCw
              className={`w-5 h-5 text-primary transition-transform ${refreshing ? "animate-spin" : ""}`}
              style={{
                transform: refreshing ? undefined : `rotate(${pullDistance * 5}deg)`,
              }}
            />
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default PullToRefresh;
