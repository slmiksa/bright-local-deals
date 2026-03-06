import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1600);
    const t3 = setTimeout(() => setExiting(true), 3200);
    const t4 = setTimeout(() => onFinish(), 4000);
    return () => { [t1, t2, t3, t4].forEach(clearTimeout); };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "hsl(158 45% 32%)" }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* Ambient light orbs */}
          <motion.div
            className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, hsl(158 50% 55%), transparent 70%)" }}
            animate={{ scale: [1, 1.15, 1], x: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[-15%] left-[-15%] w-[350px] h-[350px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, hsl(40 75% 52%), transparent 70%)" }}
            animate={{ scale: [1, 1.2, 1], y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: i % 3 === 0 ? "hsl(40 75% 52%)" : "hsla(0 0% 100% / 0.4)",
                left: `${10 + (i * 7) % 80}%`,
                top: `${15 + (i * 11) % 70}%`,
              }}
              animate={{
                y: [0, -30 - (i * 5), 0],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 2.5 + (i * 0.3),
                delay: i * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Main content */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Logo mark */}
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 120, damping: 12 }}
            >
              {/* Outer ring */}
              <motion.div
                className="w-28 h-28 rounded-[32px] flex items-center justify-center relative"
                style={{
                  background: "linear-gradient(135deg, hsla(0 0% 100% / 0.15), hsla(0 0% 100% / 0.05))",
                  backdropFilter: "blur(20px)",
                  border: "1.5px solid hsla(0 0% 100% / 0.2)",
                }}
              >
                {/* Inner glow */}
                <motion.div
                  className="absolute inset-2 rounded-[26px]"
                  style={{
                    background: "linear-gradient(135deg, hsla(40 75% 52% / 0.15), transparent)",
                  }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Glasses icon with shimmer */}
                <motion.span
                  className="text-5xl relative z-10"
                  animate={{ 
                    rotateY: [0, 360],
                  }}
                  transition={{ 
                    duration: 2, 
                    delay: 0.8,
                    ease: "easeInOut",
                  }}
                >
                  👓
                </motion.span>
              </motion.div>

              {/* Orbiting dot */}
              <motion.div
                className="absolute w-3 h-3 rounded-full"
                style={{ 
                  background: "linear-gradient(135deg, hsl(40 75% 52%), hsl(40 85% 62%))",
                  boxShadow: "0 0 12px hsl(40 75% 52%)",
                  top: -4, 
                  right: -4,
                }}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>

            {/* App name with reveal */}
            <motion.div className="flex flex-col items-center gap-2">
              <motion.div className="overflow-hidden">
                <motion.h1
                  className="text-[52px] font-black tracking-tight leading-none"
                  style={{ 
                    color: "white",
                    textShadow: "0 4px 30px hsla(0 0% 0% / 0.3)",
                  }}
                  initial={{ y: 60 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  لمحة للتسويق الالكتروني
                </motion.h1>
              </motion.div>
              <motion.div className="overflow-hidden">
                <motion.p
                  className="text-[18px] font-bold tracking-widest"
                  style={{ 
                    color: "hsla(0 0% 100% / 0.8)",
                    textShadow: "0 2px 10px hsla(0 0% 0% / 0.3)",
                  }}
                  initial={{ y: 40 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  Lamha Ads
                </motion.p>
              </motion.div>
            </motion.div>

            {/* Gold accent line */}
            <motion.div
              className="h-[2px] rounded-full my-4"
              style={{ background: "linear-gradient(90deg, transparent, hsl(40 75% 52%), transparent)" }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 80, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
            />

            {/* Subtitle */}
            <motion.div className="overflow-hidden">
              <motion.p
                className="text-[15px] font-semibold tracking-wide"
                style={{ color: "hsla(0 0% 100% / 0.7)" }}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                للتسويق الإلكتروني
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Phase 1: Animated tagline */}
          {phase >= 1 && (
            <motion.div
              className="relative z-10 mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.p
                className="text-[22px] font-bold text-center"
                style={{ color: "hsla(0 0% 100% / 0.9)" }}
              >
                {"إعلانك يوصل ✨".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.p>
            </motion.div>
          )}

          {/* Phase 2: Progress indicator */}
          {phase >= 2 && (
            <motion.div
              className="absolute bottom-20 flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Dots loader */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: "hsl(40 75% 52%)" }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.15,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen;
