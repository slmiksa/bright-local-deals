import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCity } from "@/contexts/CityContext";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PopupAdData {
  id: string;
  image_url: string;
  link_url: string | null;
  link_type: string;
}

const POPUP_SESSION_KEY = "lamha_popup_seen";

const PopupAd = () => {
  const { city } = useCity();
  const navigate = useNavigate();
  const [popup, setPopup] = useState<PopupAdData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!city) return;

    // Check if already seen for this city in this session
    const seen = sessionStorage.getItem(POPUP_SESSION_KEY);
    if (seen === city) return;

    const fetchPopup = async () => {
      const { data } = await supabase
        .from("popup_ads")
        .select("id, image_url, link_url, link_type")
        .eq("city", city)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setPopup(data as PopupAdData);
        setVisible(true);
        // Mark as seen for this city
        sessionStorage.setItem(POPUP_SESSION_KEY, city);
      }
    };

    // Small delay so splash screen finishes first
    const timer = setTimeout(fetchPopup, 800);
    return () => clearTimeout(timer);
  }, [city]);

  const handleClose = () => setVisible(false);

  const handleClick = () => {
    if (!popup?.link_url) return;
    if (popup.link_type === "external") {
      window.open(popup.link_url, "_blank");
    } else {
      navigate(popup.link_url);
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && popup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />

          {/* Popup Content */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative max-w-[360px] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-card border border-border shadow-lg flex items-center justify-center z-10 active:scale-90 transition-transform"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>

            {/* Image */}
            <div
              className={`rounded-2xl overflow-hidden shadow-2xl border border-border ${popup.link_url ? "cursor-pointer" : ""}`}
              onClick={popup.link_url ? handleClick : undefined}
            >
              <img
                src={popup.image_url}
                alt="إعلان"
                className="w-full object-contain max-h-[70vh]"
              />
              {popup.link_url && (
                <div className="bg-primary text-primary-foreground text-center py-3 text-sm font-bold active:bg-primary/90 transition-colors">
                  عرض التفاصيل
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PopupAd;
