import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const ImageLightbox = ({ images, initialIndex = 0, onClose }: ImageLightboxProps) => {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const prev = () => setCurrent((c) => (c > 0 ? c - 1 : images.length - 1));
  const next = () => setCurrent((c) => (c < images.length - 1 ? c + 1 : 0));

  const content = (
    <div
      className="fixed inset-0 bg-black/95 flex items-center justify-center"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center active:bg-white/30 transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <img
        src={images[current]}
        alt={`صورة ${current + 1}`}
        className="max-w-[90%] max-h-[75vh] object-contain rounded-xl select-none"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center active:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center active:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={`h-2 rounded-full transition-all ${
                  i === current ? "w-6 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}

      <p className="absolute top-5 right-5 text-white/70 text-[13px] font-medium">
        {current + 1} / {images.length}
      </p>
    </div>
  );

  return createPortal(content, document.body);
};

export default ImageLightbox;
