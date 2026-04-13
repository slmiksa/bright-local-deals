import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const DISMISS_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 0.3;
const SWIPE_DISTANCE_THRESHOLD = 40;

const ImageLightbox = ({ images, initialIndex = 0, onClose }: ImageLightboxProps) => {
  const [current, setCurrent] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  
  // Swipe state
  const [swipeX, setSwipeX] = useState(0);
  const [isSwipingHorizontal, setIsSwipingHorizontal] = useState(false);
  const [swipeTransition, setSwipeTransition] = useState(false);
  
  // Dismiss state
  const [dismissY, setDismissY] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);
  const [dismissTransition, setDismissTransition] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastTap = useRef(0);
  const gestureDecided = useRef(false);
  
  // Velocity tracking
  const velocityRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, lastTime: 0 });
  
  const touchRef = useRef<{
    startX: number;
    startY: number;
    dist: number;
    scaling: boolean;
    moved: boolean;
    startTime: number;
  }>({
    startX: 0, startY: 0, dist: 0, scaling: false, moved: false, startTime: 0,
  });

  const handleClose = useCallback(() => {
    document.body.style.overflow = "";
    onClose();
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [handleClose]);

  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setSwipeX(0);
    setIsSwipingHorizontal(false);
  }, [current]);

  const prev = useCallback(() => setCurrent(c => (c > 0 ? c - 1 : images.length - 1)), [images.length]);
  const next = useCallback(() => setCurrent(c => (c < images.length - 1 ? c + 1 : 0)), [images.length]);

  const getDistance = (t1: React.Touch, t2: React.Touch) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

  const handleTouchStart = (e: React.TouchEvent) => {
    setSwipeTransition(false);
    setDismissTransition(false);
    gestureDecided.current = false;

    if (e.touches.length === 2) {
      e.preventDefault();
      touchRef.current.scaling = true;
      touchRef.current.dist = getDistance(e.touches[0], e.touches[1]);
      return;
    }

    touchRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      dist: 0,
      scaling: false,
      moved: false,
      startTime: Date.now(),
    };

    velocityRef.current = {
      x: 0, y: 0,
      lastX: e.touches[0].clientX,
      lastY: e.touches[0].clientY,
      lastTime: Date.now(),
    };

    // Double tap
    const now = Date.now();
    if (now - lastTap.current < 280) {
      e.preventDefault();
      if (scale > 1) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      } else {
        setScale(2.5);
      }
      touchRef.current.moved = true;
      gestureDecided.current = true;
    }
    lastTap.current = now;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Pinch zoom
    if (e.touches.length === 2 && touchRef.current.scaling) {
      e.preventDefault();
      const newDist = getDistance(e.touches[0], e.touches[1]);
      const ratio = newDist / touchRef.current.dist;
      setScale(s => Math.min(5, Math.max(1, s * ratio)));
      touchRef.current.dist = newDist;
      touchRef.current.moved = true;
      return;
    }

    if (e.touches.length !== 1) return;

    const dx = e.touches[0].clientX - touchRef.current.startX;
    const dy = e.touches[0].clientY - touchRef.current.startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Track velocity with exponential smoothing
    const now = Date.now();
    const dt = now - velocityRef.current.lastTime;
    if (dt > 0) {
      const vx = (e.touches[0].clientX - velocityRef.current.lastX) / dt;
      const vy = (e.touches[0].clientY - velocityRef.current.lastY) / dt;
      velocityRef.current.x = vx * 0.7 + velocityRef.current.x * 0.3;
      velocityRef.current.y = vy * 0.7 + velocityRef.current.y * 0.3;
      velocityRef.current.lastX = e.touches[0].clientX;
      velocityRef.current.lastY = e.touches[0].clientY;
      velocityRef.current.lastTime = now;
    }

    // Zoomed pan
    if (scale > 1) {
      e.preventDefault();
      const moveDx = e.touches[0].clientX - velocityRef.current.lastX + (e.touches[0].clientX - velocityRef.current.lastX);
      setTranslate(t => ({
        x: t.x + (e.touches[0].clientX - (velocityRef.current.lastX - (e.touches[0].clientX - velocityRef.current.lastX))),
        y: t.y + (e.touches[0].clientY - (velocityRef.current.lastY - (e.touches[0].clientY - velocityRef.current.lastY))),
      }));
      // Simpler approach for zoomed panning
      const panDx = e.touches[0].clientX - touchRef.current.startX;
      const panDy = e.touches[0].clientY - touchRef.current.startY;
      if (!touchRef.current.moved && (Math.abs(panDx) > 4 || Math.abs(panDy) > 4)) {
        touchRef.current.moved = true;
      }
      return;
    }

    // Decide gesture direction
    if (!gestureDecided.current && (absDx > 8 || absDy > 8)) {
      gestureDecided.current = true;
      touchRef.current.moved = true;
      if (absDy > absDx * 1.2 && images.length <= 1 || absDy > absDx * 1.5) {
        setIsDismissing(true);
        setIsSwipingHorizontal(false);
      } else {
        setIsSwipingHorizontal(true);
        setIsDismissing(false);
      }
    }

    if (!gestureDecided.current) return;

    e.preventDefault();

    if (isDismissing) {
      setDismissY(dy);
    } else if (isSwipingHorizontal) {
      // Add rubber-band effect at edges
      let adjustedDx = dx;
      if ((current === 0 && dx > 0) || (current === images.length - 1 && dx < 0)) {
        adjustedDx = dx * 0.3; // rubber band
      }
      setSwipeX(adjustedDx);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Pinch end
    if (touchRef.current.scaling && e.touches.length < 2) {
      touchRef.current.scaling = false;
      if (scale <= 1) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      }
      return;
    }

    // Dismiss gesture
    if (isDismissing) {
      const velocity = Math.abs(velocityRef.current.y);
      if (Math.abs(dismissY) > DISMISS_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
        handleClose();
      } else {
        setDismissTransition(true);
        setDismissY(0);
      }
      setIsDismissing(false);
      return;
    }

    // Horizontal swipe
    if (isSwipingHorizontal && images.length > 1) {
      const velocity = velocityRef.current.x;
      const shouldSwipe = Math.abs(swipeX) > SWIPE_DISTANCE_THRESHOLD || Math.abs(velocity) > SWIPE_VELOCITY_THRESHOLD;
      
      setSwipeTransition(true);
      
      if (shouldSwipe && (swipeX > 0 || velocity > SWIPE_VELOCITY_THRESHOLD)) {
        if (current > 0) {
          setSwipeX(window.innerWidth);
          setTimeout(() => prev(), 280);
        } else {
          setSwipeX(0);
        }
      } else if (shouldSwipe && (swipeX < 0 || velocity < -SWIPE_VELOCITY_THRESHOLD)) {
        if (current < images.length - 1) {
          setSwipeX(-window.innerWidth);
          setTimeout(() => next(), 280);
        } else {
          setSwipeX(0);
        }
      } else {
        setSwipeX(0);
      }
      
      setIsSwipingHorizontal(false);
      return;
    }

    // Tap to navigate (only if no gesture happened)
    if (scale === 1 && !touchRef.current.moved && e.changedTouches.length === 1 && images.length > 1) {
      const tapX = e.changedTouches[0].clientX;
      const screenW = window.innerWidth;
      if (tapX > screenW * 0.65) next();
      else if (tapX < screenW * 0.35) prev();
    }
  };

  // Zoomed panning - track position directly
  const panStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const handleZoomTouchStart = (startX: number, startY: number) => {
    panStartRef.current = { x: startX, y: startY, tx: translate.x, ty: translate.y };
  };

  useEffect(() => {
    if (scale > 1) {
      const onStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          panStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            tx: translate.x,
            ty: translate.y,
          };
        }
      };
      const onMove = (e: TouchEvent) => {
        if (e.touches.length === 1 && scale > 1) {
          const dx = e.touches[0].clientX - panStartRef.current.x;
          const dy = e.touches[0].clientY - panStartRef.current.y;
          setTranslate({
            x: panStartRef.current.tx + dx,
            y: panStartRef.current.ty + dy,
          });
        }
      };
      const el = containerRef.current;
      if (el) {
        el.addEventListener("touchstart", onStart, { passive: true });
        el.addEventListener("touchmove", onMove, { passive: false });
        return () => {
          el.removeEventListener("touchstart", onStart);
          el.removeEventListener("touchmove", onMove);
        };
      }
    }
  }, [scale, translate.x, translate.y]);

  const dismissProgress = Math.min(Math.abs(dismissY) / DISMISS_THRESHOLD, 1);
  const bgOpacity = 0.95 - dismissProgress * 0.5;
  const imgScale = 1 - dismissProgress * 0.15;

  const getImageTransform = () => {
    if (isDismissing || dismissY !== 0) {
      return `translateY(${dismissY}px) scale(${imgScale})`;
    }
    if (scale > 1) {
      return `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`;
    }
    if (swipeX !== 0) {
      return `translateX(${swipeX}px)`;
    }
    return "none";
  };

  const getTransition = () => {
    if (dismissTransition) return "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    if (swipeTransition) return "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    if (isDismissing || isSwipingHorizontal) return "none";
    return "transform 0.2s ease-out";
  };

  return createPortal(
    <div
      ref={containerRef}
      onTouchStart={scale <= 1 ? handleTouchStart : undefined}
      onTouchMove={scale <= 1 ? handleTouchMove : undefined}
      onTouchEnd={scale <= 1 ? handleTouchEnd : undefined}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483647,
        backgroundColor: `rgba(0,0,0,${bgOpacity})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "none",
        transition: dismissTransition ? "background-color 0.3s ease" : "none",
        willChange: "background-color",
        overflow: "hidden",
      }}
    >
      <img
        src={images[current]}
        alt={`صورة ${current + 1}`}
        draggable={false}
        style={{
          maxWidth: "100%",
          maxHeight: "80vh",
          objectFit: "contain",
          userSelect: "none",
          pointerEvents: "none",
          transform: getImageTransform(),
          transition: getTransition(),
          willChange: "transform",
          borderRadius: dismissProgress > 0 ? `${dismissProgress * 16}px` : "0",
        }}
      />

      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 6,
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              style={{
                height: 8,
                width: i === current ? 24 : 8,
                borderRadius: 4,
                backgroundColor: i === current ? "white" : "rgba(255,255,255,0.4)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            />
          ))}
        </div>
      )}

      <p style={{
        position: "absolute",
        top: 64,
        right: 20,
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
        fontWeight: 500,
        margin: 0,
      }}>
        {current + 1} / {images.length}
      </p>
    </div>,
    document.body
  );
};

export default ImageLightbox;
