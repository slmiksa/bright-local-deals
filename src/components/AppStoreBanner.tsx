import { useState, useEffect } from "react";
import { X } from "lucide-react";

const APP_STORE_URL = "https://apps.apple.com/sa/app/lamha-ads/id6760237672?l=ar";
const DISMISSED_KEY = "lamha_appstore_dismissed";

const AppStoreBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
    if (isNative) return;

    const lastDismissed = localStorage.getItem(DISMISSED_KEY);
    if (lastDismissed && Date.now() - Number(lastDismissed) < 5 * 60 * 1000) return;

    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-[430px] mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 rounded-2xl bg-card border border-border shadow-elevated px-4 py-3">
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          {/* Apple logo */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
            <svg viewBox="0 0 384 512" className="w-5 h-5 fill-card">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-62.1 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-foreground leading-tight">حمّل تطبيق لمحة</p>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">متوفر على App Store</p>
          </div>
        </a>
        <button
          onClick={() => {
            setVisible(false);
            localStorage.setItem(DISMISSED_KEY, String(Date.now()));
          }}
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default AppStoreBanner;
