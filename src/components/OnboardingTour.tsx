import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Star, Plus, ChevronLeft } from "lucide-react";

interface TourStep {
  target: string; // CSS selector or position hint
  title: string;
  description: string;
  icon: React.ReactNode;
  position: "top" | "center" | "bottom";
  highlightArea: { top: string; left: string; width: string; height: string };
}

const steps: TourStep[] = [
  {
    target: "city",
    title: "اختر مدينتك",
    description: "اضغط هنا لتحديد مدينتك ومشاهدة الإعلانات القريبة منك",
    icon: <MapPin className="w-6 h-6" />,
    position: "top",
    highlightArea: { top: "6px", left: "72%", width: "180px", height: "58px" },
  },
  {
    target: "featured",
    title: "إعلانات مميزة",
    description: "تصفح أبرز الإعلانات والعروض المميزة في مدينتك",
    icon: <Star className="w-6 h-6" />,
    position: "center",
    highlightArea: { top: "75px", left: "50%", width: "92%", height: "220px" },
  },
  {
    target: "add",
    title: "أضف إعلانك",
    description: "اضغط هنا لإضافة إعلانك الخاص والوصول لآلاف المستخدمين",
    icon: <Plus className="w-6 h-6" />,
    position: "bottom",
    highlightArea: { top: "calc(100% - 78px)", left: "50%", width: "64px", height: "64px" },
  },
];

const OnboardingTour = ({ onFinish }: { onFinish: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) {
      onFinish();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [isLast, onFinish]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200]" onClick={handleNext}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Highlight cutout - visual indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="absolute rounded-2xl border-2 border-primary/80 shadow-[0_0_0_4000px_rgba(0,0,0,0.7)]"
          style={{
            top: step.highlightArea.top,
            left: step.highlightArea.left,
            width: step.highlightArea.width,
            height: step.highlightArea.height,
            transform: "translateX(-50%)",
            boxShadow: "0 0 30px 5px hsl(var(--primary) / 0.3), 0 0 0 4000px rgba(0,0,0,0.65)",
            background: "transparent",
          }}
        />
      </AnimatePresence>

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: step.position === "bottom" ? 30 : -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: step.position === "bottom" ? 30 : -30 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="absolute left-1/2 -translate-x-1/2 w-[85%] max-w-[360px]"
          style={{
            ...(step.position === "top" && { top: "90px" }),
            ...(step.position === "center" && { top: "320px" }),
            ...(step.position === "bottom" && { bottom: "110px" }),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-card rounded-2xl p-5 shadow-xl border border-border">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-3">
              {step.icon}
            </div>

            {/* Text */}
            <h3 className="text-[17px] font-bold text-foreground mb-1.5">{step.title}</h3>
            <p className="text-[14px] text-muted-foreground leading-relaxed">{step.description}</p>

            {/* Actions */}
            <div className="flex items-center justify-between mt-5">
              {/* Dots */}
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/25"
                    }`}
                  />
                ))}
              </div>

              {/* Button */}
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-[13px] active:scale-95 transition-transform"
              >
                {isLast ? "ابدأ" : "التالي"}
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip */}
      <button
        onClick={(e) => { e.stopPropagation(); onFinish(); }}
        className="absolute top-14 left-5 text-[13px] text-white/70 font-medium active:text-white z-10"
      >
        تخطي
      </button>
    </div>
  );
};

export default OnboardingTour;
