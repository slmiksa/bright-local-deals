import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { X, ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVideoAds } from "@/hooks/useVideoAds";
import { useCity } from "@/contexts/CityContext";

function shuffle<T>(arr: T[]): T[] {

const GalleryPage = () => {
  const navigate = useNavigate();
  const { city } = useCity();
  const { data: videos = [], isLoading } = useVideoAds(city);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const shuffled = useMemo(() => (videos.length ? shuffle(videos) : []), [videos]);

  const tripled = useMemo(() => {
    if (!shuffled.length) return [];
    return [...shuffled, ...shuffled, ...shuffled];
  }, [shuffled]);

  const len = shuffled.length;

  // Start in the middle set
  useEffect(() => {
    if (!len || !containerRef.current) return;
    const container = containerRef.current;
    requestAnimationFrame(() => {
      const itemH = container.clientHeight;
      container.scrollTop = itemH * len;
    });
  }, [len]);

  // Observe which video is visible
  useEffect(() => {
    if (!tripled.length) return;
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
  }, [tripled]);

  // Infinite loop reposition
  useEffect(() => {
    if (!len) return;
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const itemH = container.clientHeight;
        const scrollTop = container.scrollTop;
        const totalMiddleStart = itemH * len;
        const totalMiddleEnd = itemH * len * 2;

        if (scrollTop < itemH * 0.5) {
          container.scrollTop = scrollTop + totalMiddleStart;
        } else if (scrollTop >= totalMiddleEnd - itemH * 0.5) {
          container.scrollTop = scrollTop - totalMiddleStart;
        }
        ticking = false;
      });
    };

    container.addEventListener("scrollend", handleScroll);
    return () => container.removeEventListener("scrollend", handleScroll);
  }, [len]);

  // Autoplay active video, pause others, handle mute
  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === activeIndex) {
        vid.muted = isMuted;
        vid.currentTime = 0;
        vid.play().catch(() => {});
      } else {
        vid.pause();
        vid.muted = true;
      }
    });
  }, [activeIndex, tripled, isMuted]);

  // Record view when active video changes
  const lastRecordedRef = useRef<string>("");
  useEffect(() => {
    if (!tripled.length) return;
    const realIdx = activeIndex % len;
    const video = shuffled[realIdx];
    if (!video) return;
    const key = `${video.adId}-${realIdx}`;
    if (lastRecordedRef.current !== key) {
      lastRecordedRef.current = key;
      recordView(video.adId);
    }
  }, [activeIndex, shuffled, len, tripled]);

  const setVideoRef = useCallback(
    (idx: number) => (el: HTMLVideoElement | null) => {
      videoRefs.current[idx] = el;
    },
    []
  );

  const goBack = () => navigate(-1);

  const activeAdId = tripled.length ? tripled[activeIndex % tripled.length]?.adId : null;

  // Check if video is near active (within 2) for src loading
  const isNearActive = (idx: number) => Math.abs(idx - activeIndex) <= 2;

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
        <button onClick={goBack} className="text-white/90 text-sm underline">العودة</button>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black"
      style={{ top: 0, left: 0, right: 0, bottom: 0, height: "100%", width: "100%" }}
    >
      {/* Close button */}
      <button
        onClick={goBack}
        className="absolute right-4 z-[110] w-11 h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform"
        style={{ top: "calc(env(safe-area-inset-top, 20px) + 12px)" }}
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Mute toggle */}
      <button
        onClick={() => setIsMuted(prev => !prev)}
        className="absolute right-3 z-[110] w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 24px) + 140px)" }}
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-white/80" /> : <Volume2 className="w-5 h-5 text-white" />}
      </button>

      {/* Video feed */}
      <div
        ref={containerRef}
        className="w-full overflow-y-scroll snap-y snap-mandatory"
        style={{ height: "100%", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {tripled.map((video, idx) => (
          <div
            key={`${video.adId}-${idx}`}
            data-index={idx}
            className="w-full snap-start snap-always relative"
            style={{ height: "100%" }}
          >
            <video
              ref={setVideoRef(idx)}
              src={isNearActive(idx) ? video.videoUrl : undefined}
              className="absolute inset-0 h-full w-full object-cover"
              loop
              muted
              playsInline
              preload={isNearActive(idx) ? "auto" : "none"}
            />

            {/* Bottom overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 pt-24 px-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 24px) + 8px)" }}
            >
              <div className="text-right pr-14">
                <h3 className="text-white text-lg font-bold mb-1">{video.shopName}</h3>
                <p className="text-white/70 text-sm mb-4 line-clamp-1">{video.offer}</p>
              </div>
              <div className="flex justify-end pr-14">
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
