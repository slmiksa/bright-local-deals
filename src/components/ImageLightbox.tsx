import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const DISMISS_THRESHOLD = 100;
const MIN_SCALE = 1;
const MAX_SCALE = 5;

const ImageLightbox = ({ images, initialIndex = 0, onClose }: ImageLightboxProps) => {
  const [current, setCurrent] = useState(initialIndex);
  const scaleRef = useRef(1);
  const translateRef = useRef({ x: 0, y: 0 });
  const dismissYRef = useRef(0);
  const [, forceRender] = useState(0);
  const rerender = () => forceRender(c => c + 1);

  const isDismissing = useRef(false);
  const animFrameRef = useRef<number>(0);
  const imgRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch tracking
  const touchRef = useRef({
    startX: 0, startY: 0,
    lastX: 0, lastY: 0,
    dist: 0,
    scaling: false,
    moved: false,
    startTime: 0,
    pinchCenter: { x: 0, y: 0 },
    initialScale: 1,
    initialTranslate: { x: 0, y: 0 },
  });
  const lastTap = useRef(0);
  const velocityRef = useRef({ x: 0, y: 0 });

  const handleClose = useCallback(() => {
    document.body.style.overflow = "";
    onClose();
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [handleClose]);

  useEffect(() => {
    scaleRef.current = 1;
    translateRef.current = { x: 0, y: 0 };
    dismissYRef.current = 0;
    applyTransform();
  }, [current]);

  const applyTransform = useCallback(() => {
    if (!imgRef.current) return;
    const s = scaleRef.current;
    const t = translateRef.current;
    const dy = dismissYRef.current;

    if (isDismissing.current || dy !== 0) {
      const progress = Math.min(Math.abs(dy) / DISMISS_THRESHOLD, 1);
      const imgScale = 1 - progress * 0.12;
      imgRef.current.style.transform = `translateY(${dy}px) scale(${imgScale})`;
      imgRef.current.style.borderRadius = `${progress * 16}px`;
      if (containerRef.current) {
        containerRef.current.style.backgroundColor = `rgba(0,0,0,${0.95 - progress * 0.5})`;
      }
    } else {
      imgRef.current.style.transform = `scale(${s}) translate(${t.x / s}px, ${t.y / s}px)`;
      imgRef.current.style.borderRadius = "0";
      if (containerRef.current) {
        containerRef.current.style.backgroundColor = `rgba(0,0,0,0.95)`;
      }
    }
  }, []);

  // Smooth animate to target values
  const animateTo = useCallback((targetScale: number, targetX: number, targetY: number, duration = 280) => {
    const startScale = scaleRef.current;
    const startX = translateRef.current.x;
    const startY = translateRef.current.y;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      scaleRef.current = startScale + (targetScale - startScale) * ease;
      translateRef.current.x = startX + (targetX - startX) * ease;
      translateRef.current.y = startY + (targetY - startY) * ease;
      applyTransform();

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(tick);
  }, [applyTransform]);

  const animateDismissReset = useCallback(() => {
    const startY = dismissYRef.current;
    const startTime = performance.now();
    const duration = 250;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      dismissYRef.current = startY * (1 - ease);
      applyTransform();
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(tick);
  }, [applyTransform]);

  const clampTranslate = useCallback(() => {
    if (!imgRef.current) return;
    const s = scaleRef.current;
    if (s <= 1) {
      translateRef.current = { x: 0, y: 0 };
      return;
    }
    const rect = imgRef.current.getBoundingClientRect();
    const maxX = (rect.width * (s - 1)) / (2 * s);
    const maxY = (rect.height * (s - 1)) / (2 * s);
    translateRef.current.x = Math.max(-maxX, Math.min(maxX, translateRef.current.x));
    translateRef.current.y = Math.max(-maxY, Math.min(maxY, translateRef.current.y));
  }, []);

  const prev = () => setCurrent((c) => (c > 0 ? c - 1 : images.length - 1));
  const next = () => setCurrent((c) => (c < images.length - 1 ? c + 1 : 0));

  const getDistance = (t1: React.Touch, t2: React.Touch) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

  const getMidpoint = (t1: React.Touch, t2: React.Touch) => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    cancelAnimationFrame(animFrameRef.current);

    if (e.touches.length === 2) {
      e.preventDefault();
      touchRef.current.scaling = true;
      touchRef.current.dist = getDistance(e.touches[0], e.touches[1]);
      touchRef.current.pinchCenter = getMidpoint(e.touches[0], e.touches[1]);
      touchRef.current.initialScale = scaleRef.current;
      touchRef.current.initialTranslate = { ...translateRef.current };
    } else if (e.touches.length === 1) {
      touchRef.current.scaling = false;
      touchRef.current.moved = false;
      isDismissing.current = false;
      touchRef.current.startX = e.touches[0].clientX;
      touchRef.current.startY = e.touches[0].clientY;
      touchRef.current.lastX = e.touches[0].clientX;
      touchRef.current.lastY = e.touches[0].clientY;
      touchRef.current.startTime = Date.now();
      velocityRef.current = { x: 0, y: 0 };

      // Double tap
      const now = Date.now();
      if (now - lastTap.current < 300) {
        e.preventDefault();
        touchRef.current.moved = true;
        if (scaleRef.current > 1.1) {
          animateTo(1, 0, 0);
        } else {
          // Zoom into tap point
          const tapX = e.touches[0].clientX;
          const tapY = e.touches[0].clientY;
          const rect = imgRef.current?.getBoundingClientRect();
          if (rect) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const offsetX = (centerX - tapX) * 1.5;
            const offsetY = (centerY - tapY) * 1.5;
            animateTo(2.5, offsetX, offsetY);
          } else {
            animateTo(2.5, 0, 0);
          }
        }
        lastTap.current = 0;
        return;
      }
      lastTap.current = now;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchRef.current.scaling) {
      e.preventDefault();
      const newDist = getDistance(e.touches[0], e.touches[1]);
      const rawRatio = newDist / touchRef.current.dist;
      
      // Apply scale relative to initial pinch scale for smoothness
      let newScale = touchRef.current.initialScale * rawRatio;
      
      // Rubber-band beyond limits
      if (newScale < MIN_SCALE) {
        newScale = MIN_SCALE - (MIN_SCALE - newScale) * 0.3;
      } else if (newScale > MAX_SCALE) {
        newScale = MAX_SCALE + (newScale - MAX_SCALE) * 0.15;
      }

      scaleRef.current = newScale;
      touchRef.current.moved = true;
      applyTransform();
    } else if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchRef.current.startX;
      const dy = e.touches[0].clientY - touchRef.current.startY;
      const moveDx = e.touches[0].clientX - touchRef.current.lastX;
      const moveDy = e.touches[0].clientY - touchRef.current.lastY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Track velocity for momentum
      velocityRef.current = { x: moveDx, y: moveDy };

      // Detect dismiss: vertical dominant, not zoomed
      if (!isDismissing.current && scaleRef.current <= 1.05 && !touchRef.current.moved && absDy > 10 && absDy > absDx * 1.3) {
        isDismissing.current = true;
        touchRef.current.moved = true;
      }

      if (isDismissing.current) {
        e.preventDefault();
        dismissYRef.current = dy;
        applyTransform();
        touchRef.current.lastX = e.touches[0].clientX;
        touchRef.current.lastY = e.touches[0].clientY;
        return;
      }

      if (absDx > 6 || absDy > 6) touchRef.current.moved = true;

      if (scaleRef.current > 1.05) {
        e.preventDefault();
        translateRef.current.x += moveDx;
        translateRef.current.y += moveDy;
        applyTransform();
      }

      touchRef.current.lastX = e.touches[0].clientX;
      touchRef.current.lastY = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDismissing.current) {
      isDismissing.current = false;
      const vel = Math.abs(velocityRef.current.y);
      if (Math.abs(dismissYRef.current) > DISMISS_THRESHOLD || vel > 8) {
        handleClose();
      } else {
        animateDismissReset();
      }
      return;
    }

    if (touchRef.current.scaling && e.touches.length < 2) {
      touchRef.current.scaling = false;
      // Snap back if below min
      if (scaleRef.current < MIN_SCALE) {
        animateTo(1, 0, 0);
      } else if (scaleRef.current > MAX_SCALE) {
        clampTranslate();
        animateTo(MAX_SCALE, translateRef.current.x, translateRef.current.y);
      } else if (scaleRef.current < 1.15) {
        // Snap to 1 if close
        animateTo(1, 0, 0);
      } else {
        clampTranslate();
        applyTransform();
      }
      return;
    }

    // Momentum for panning
    if (scaleRef.current > 1.05 && touchRef.current.moved) {
      const vx = velocityRef.current.x * 5;
      const vy = velocityRef.current.y * 5;
      const targetX = translateRef.current.x + vx;
      const targetY = translateRef.current.y + vy;
      translateRef.current.x = targetX;
      translateRef.current.y = targetY;
      clampTranslate();
      animateTo(scaleRef.current, translateRef.current.x, translateRef.current.y, 350);
      return;
    }

    // Swipe navigation when not zoomed
    if (scaleRef.current <= 1.05 && touchRef.current.moved && e.changedTouches.length === 1 && images.length > 1) {
      const swipeDx = e.changedTouches[0].clientX - touchRef.current.startX;
      if (Math.abs(swipeDx) > 40) {
        if (swipeDx < 0) next();
        else prev();
        return;
      }
    }

    // Tap navigation
    if (scaleRef.current <= 1.05 && !touchRef.current.moved && e.changedTouches.length === 1 && images.length > 1) {
      const tapX = e.changedTouches[0].clientX;
      const screenW = window.innerWidth;
      if (tapX > screenW * 0.65) next();
      else if (tapX < screenW * 0.35) prev();
    }
  };

  return createPortal(
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2147483647,
        backgroundColor: "rgba(0,0,0,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "none",
      }}
    >
      <div
        ref={imgRef}
        style={{
          maxWidth: "100%",
          maxHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          willChange: "transform",
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
          }}
        />
      </div>

      {images.length > 1 && (
        <div style={{
          position: "absolute", bottom: 32, left: "50%",
          transform: "translateX(-50%)", display: "flex", gap: 6,
        }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              style={{
                height: 8,
                width: i === current ? 24 : 8,
                borderRadius: 4,
                backgroundColor: i === current ? "white" : "rgba(255,255,255,0.4)",
                border: "none", cursor: "pointer", transition: "all 0.2s",
              }}
            />
          ))}
        </div>
      )}

      <p style={{
        position: "absolute", top: 64, right: 20,
        color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, margin: 0,
      }}>
        {current + 1} / {images.length}
      </p>
    </div>,
    document.body
  );
};

export default ImageLightbox;
