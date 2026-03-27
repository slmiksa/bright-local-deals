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
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Close button */}
      <button
        onClick={goBack}
        className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
        style={{ top: "calc(env(safe-area-inset-top, 16px) + 8px)" }}
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Counter */}
      <div
        className="absolute top-4 left-4 z-[110] text-white/70 text-xs font-medium bg-black/40 rounded-full px-3 py-1.5 backdrop-blur-sm"
        style={{ top: "calc(env(safe-area-inset-top, 16px) + 8px)" }}
      >
        {activeIndex + 1} / {videos.length}
      </div>

      {/* Video feed */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {videos.map((video, idx) => (
          <div
            key={`${video.adId}-${idx}`}
            data-index={idx}
            className="h-full w-full snap-start snap-always relative flex items-center justify-center"
          >
            <video
              ref={setVideoRef(idx)}
              src={video.videoUrl}
              className="h-full w-full object-cover"
              loop
              muted
              playsInline
              preload={Math.abs(idx - activeIndex) <= 1 ? "auto" : "none"}
            />

            {/* Bottom overlay */}
            <div className="absolute bottom-0 left-0 right-0 pb-8 pt-20 px-5 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 32px) + 24px)" }}
            >
              <h3 className="text-white text-lg font-bold mb-1">{video.shopName}</h3>
              <p className="text-white/70 text-sm mb-4 line-clamp-1">{video.offer}</p>
              <button
                onClick={() => navigate(`/ad/${video.adId}`)}
                className="flex items-center gap-2 bg-white text-black font-bold text-sm px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-4 h-4" />
                عرض الإعلان
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;
