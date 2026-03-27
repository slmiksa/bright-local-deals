import { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const ImageLightbox = ({ images, initialIndex = 0, onClose }: ImageLightboxProps) => {
  const [current, setCurrent] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const touchRef = useRef<{ startX: number; startY: number; dist: number; scaling: boolean; moved: boolean }>({
    startX: 0, startY: 0, dist: 0, scaling: false, moved: false,
  });
  const lastTap = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

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
    };
  }, [handleClose]);

  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [current]);

  const prev = () => setCurrent((c) => (c > 0 ? c - 1 : images.length - 1));
  const next = () => setCurrent((c) => (c < images.length - 1 ? c + 1 : 0));

  const getDistance = (t1: React.Touch, t2: React.Touch) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      touchRef.current.scaling = true;
      touchRef.current.dist = getDistance(e.touches[0], e.touches[1]);
    } else if (e.touches.length === 1) {
      touchRef.current.scaling = false;
      touchRef.current.moved = false;
      touchRef.current.startX = e.touches[0].clientX;
      touchRef.current.startY = e.touches[0].clientY;

      // Double tap to zoom
      const now = Date.now();
      if (now - lastTap.current < 300) {
        e.preventDefault();
        if (scale > 1) {
          setScale(1);
          setTranslate({ x: 0, y: 0 });
        } else {
          setScale(2.5);
        }
        touchRef.current.moved = true; // prevent tap navigation on double tap
      }
      lastTap.current = now;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchRef.current.scaling) {
      e.preventDefault();
      const newDist = getDistance(e.touches[0], e.touches[1]);
      const ratio = newDist / touchRef.current.dist;
      setScale((s) => Math.min(5, Math.max(1, s * ratio)));
      touchRef.current.dist = newDist;
      touchRef.current.moved = true;
    } else if (e.touches.length === 1) {
      const dx = Math.abs(e.touches[0].clientX - touchRef.current.startX);
      const dy = Math.abs(e.touches[0].clientY - touchRef.current.startY);
      if (dx > 8 || dy > 8) touchRef.current.moved = true;

      if (scale > 1) {
        e.preventDefault();
        const ddx = e.touches[0].clientX - touchRef.current.startX;
        const ddy = e.touches[0].clientY - touchRef.current.startY;
        setTranslate((t) => ({ x: t.x + ddx, y: t.y + ddy }));
        touchRef.current.startX = e.touches[0].clientX;
        touchRef.current.startY = e.touches[0].clientY;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchRef.current.scaling && e.touches.length < 2) {
      touchRef.current.scaling = false;
      if (scale <= 1) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      }
      return;
    }

    // Tap navigation like Snapchat (only when not zoomed and not moved)
    if (scale === 1 && !touchRef.current.moved && e.changedTouches.length === 1 && images.length > 1) {
      const tapX = e.changedTouches[0].clientX;
      const screenW = window.innerWidth;
      // Tap on right 40% → next, left 40% → prev, middle 20% → do nothing
      if (tapX > screenW * 0.6) {
        next();
      } else if (tapX < screenW * 0.4) {
        prev();
      }
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483647,
        backgroundColor: "rgba(0,0,0,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "none",
      }}
    >
      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleClose(); }}
        style={{
          position: "absolute",
          top: 60,
          left: 16,
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        <X style={{ width: 22, height: 22, color: "white" }} />
      </button>

      {/* Image */}
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
          transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
          transition: scale === 1 ? "transform 0.2s ease" : "none",
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
                transition: "all 0.2s",
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
