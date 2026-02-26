import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const ImageLightbox = ({ images, initialIndex = 0, onClose }: ImageLightboxProps) => {
  const [current, setCurrent] = useState(initialIndex);

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

  const prev = () => setCurrent((c) => (c > 0 ? c - 1 : images.length - 1));
  const next = () => setCurrent((c) => (c < images.length - 1 ? c + 1 : 0));

  return createPortal(
    <div
      onClick={handleClose}
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
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.15)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <X style={{ width: 20, height: 20, color: "white" }} />
      </button>

      {/* Image */}
      <img
        src={images[current]}
        alt={`صورة ${current + 1}`}
        onClick={(e) => e.stopPropagation()}
        draggable={false}
        style={{
          maxWidth: "90%",
          maxHeight: "75vh",
          objectFit: "contain",
          borderRadius: 12,
          userSelect: "none",
        }}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronRight style={{ width: 20, height: 20, color: "white" }} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronLeft style={{ width: 20, height: 20, color: "white" }} />
          </button>

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
        </>
      )}

      <p style={{
        position: "absolute",
        top: 20,
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
