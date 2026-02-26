import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const ImageLightbox = ({ images, initialIndex = 0, onClose }: ImageLightboxProps) => {
  const [current, setCurrent] = useState(initialIndex);

  const prev = () => setCurrent((c) => (c > 0 ? c - 1 : images.length - 1));
  const next = () => setCurrent((c) => (c < images.length - 1 ? c + 1 : 0));

  return (
    <div className="fixed inset-0 z-[200] bg-foreground/95 flex items-center justify-center" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-card/20 backdrop-blur-md flex items-center justify-center active:bg-card/40 transition-colors"
      >
        <X className="w-5 h-5 text-primary-foreground" />
      </button>

      <div className="w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[current]}
          alt={`صورة ${current + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-xl"
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/20 backdrop-blur-md flex items-center justify-center active:bg-card/40 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-primary-foreground" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/20 backdrop-blur-md flex items-center justify-center active:bg-card/40 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-primary-foreground" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={`h-2 rounded-full transition-all ${
                  i === current ? "w-6 bg-primary-foreground" : "w-2 bg-primary-foreground/40"
                }`}
              />
            ))}
          </div>
        </>
      )}

      <p className="absolute top-5 right-5 text-primary-foreground/70 text-[13px] font-medium">
        {current + 1} / {images.length}
      </p>
    </div>
  );
};

export default ImageLightbox;
