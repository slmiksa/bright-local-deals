import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Star, Plus, ChevronLeft } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tooltipPosition: "top" | "center" | "bottom";
  highlightStyle: React.CSSProperties;
}

const steps: TourStep[] = [
  {
    title: "اختر مدينتك",
    description: "اضغط هنا لتحديد مدينتك ومشاهدة الإعلانات القريبة منك",
    icon: <MapPin className="w-6 h-6" />,
    tooltipPosition: "center",
    highlightStyle: {
      top: 8,
      right: 16,
      width: 160,
      height: 50,
      borderRadius: 16,
    },
  },
  {
    title: "إعلانات مميزة",
    description: "تصفح أبرز الإعلانات والعروض المميزة في مدينتك",
    icon: <Star className="w-6 h-6" />,
    tooltipPosition: "bottom",
    highlightStyle: {
      top: 70,
      left: "4%",
      width: "92%",
      height: 200,
      borderRadius: 20,
    },
  },
  {
    title: "أضف إعلانك",
    description: "اضغط هنا لإضافة إعلانك الخاص والوصول لآلاف المستخدمين",
    icon: <Plus className="w-6 h-6" />,
    tooltipPosition: "center",
    highlightStyle: {
      bottom: 28,
      left: "50%",
      transform: "translateX(-50%)",
      width: 58,
      height: 58,
      borderRadius: 18,
    },
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200]" dir="rtl" onClick={handleNext}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/75" />

      {/* Sliding step counter at top center */}
      <div className="absolute top-6 left-0 right-0 flex justify-center" style={{ zIndex: 203 }}>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-primary/20 backdrop-blur-md rounded-full px-5 py-2 flex items-center gap-3"
        >
          <span className="text-white/90 text-sm font-bold">
            {currentStep + 1} / {steps.length}
          </span>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === currentStep ? "w-6 bg-primary" : i < currentStep ? "w-1.5 bg-primary/60" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Highlight border around target */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.3 }}
          className="absolute border-2 border-primary"
          style={{
            ...step.highlightStyle,
            boxShadow: "0 0 0 4000px rgba(0,0,0,0.72), 0 0 20px 4px hsl(var(--primary) / 0.4)",
            background: "transparent",
            zIndex: 201,
          }}
        />
      </AnimatePresence>

      {/* Centered tooltip card - bigger */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.35, delay: 0.1, type: "spring", damping: 20 }}
          className="absolute inset-0 flex items-center justify-center px-5 pointer-events-none"
          style={{ zIndex: 202 }}
        >
          <div
            className="bg-card rounded-3xl p-8 shadow-2xl border border-border w-full max-w-[380px] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon - bigger */}
            <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center text-primary mb-4 mx-auto">
              {step.icon}
            </div>

            {/* Text - bigger */}
            <h3 className="text-xl font-bold text-foreground mb-3 text-center">{step.title}</h3>
            <p className="text-base text-muted-foreground leading-relaxed text-center">{step.description}</p>

            {/* Button */}
            <button
              onClick={handleNext}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-2xl font-bold text-base active:scale-95 transition-transform"
            >
              {isLast ? "ابدأ الآن" : "التالي"}
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip */}
      <button
        onClick={(e) => { e.stopPropagation(); onFinish(); }}
        className="absolute top-7 left-5 text-sm text-white/70 font-medium active:text-white backdrop-blur-sm bg-white/10 px-3 py-1.5 rounded-full"
        style={{ zIndex: 204 }}
      >
        تخطي
      </button>
    </div>
  );
};

export default OnboardingTour;
