import { useRef, useEffect, useState, useCallback } from "react";
import { X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVideoAds } from "@/hooks/useVideoAds";
import { useCity } from "@/contexts/CityContext";

const GalleryPage = () => {
  const navigate = useNavigate();
  const { city } = useCity();
  const { data: videos = [], isLoading } = useVideoAds(city);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Observe which video is visible
  useEffect(() => {
    if (!videos.length) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root: container, threshold: 0.6 }
    );

    const items = container.querySelectorAll("[data-index]");
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [videos]);

  // Autoplay active video, pause others
  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === activeIndex) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, [activeIndex, videos]);

  const setVideoRef = useCallback(
    (idx: number) => (el: HTMLVideoElement | null) => {
      videoRefs.current[idx] = el;
    },
    []
  );

  const goBack = () => navigate(-1);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-white/70 text-base">لا توجد فيديوهات حالياً</p>
        <button onClick={goBack} className="text-white/90 text-sm underline">
          العودة
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: "100dvh",
        width: "100vw",
      }}
    >
      {/* Close button - positioned well below notch/dynamic island for Capacitor */}
      <button
        onClick={goBack}
        className="absolute right-4 z-[110] w-11 h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform"
        style={{ top: "max(env(safe-area-inset-top, 20px), 20px)" }}
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Counter */}
      <div
        className="absolute left-4 z-[110] text-white/80 text-xs font-medium bg-black/50 rounded-full px-3 py-1.5 backdrop-blur-md"
        style={{ top: "max(env(safe-area-inset-top, 20px), 20px)" }}
      >
        {activeIndex + 1} / {videos.length}
      </div>

      {/* Video feed - true fullscreen with dvh */}
      <div
        ref={containerRef}
        className="w-full overflow-y-scroll snap-y snap-mandatory"
        style={{
          height: "100dvh",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {videos.map((video, idx) => (
          <div
            key={`${video.adId}-${idx}`}
            data-index={idx}
            className="w-full snap-start snap-always relative"
            style={{ height: "100dvh" }}
          >
            <video
              ref={setVideoRef(idx)}
              src={video.videoUrl}
              className="absolute inset-0 h-full w-full object-cover"
              loop
              muted
              playsInline
              preload={Math.abs(idx - activeIndex) <= 1 ? "auto" : "none"}
            />

            {/* Bottom overlay - RTL aligned text */}
            <div
              className="absolute bottom-0 left-0 right-0 pt-24 px-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom, 24px), 24px)" }}
            >
              <div className="text-right">
                <h3 className="text-white text-lg font-bold mb-1">{video.shopName}</h3>
                <p className="text-white/70 text-sm mb-4 line-clamp-1">{video.offer}</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => navigate(`/ad/${video.adId}`)}
                  className="flex items-center gap-2 bg-white text-black font-bold text-sm px-6 py-3 rounded-xl active:scale-95 transition-transform shadow-lg"
                >
                  عرض الإعلان
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;
