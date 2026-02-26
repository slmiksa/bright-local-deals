import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1600);
    const t3 = setTimeout(() => setPhase(3), 3200);
    const t4 = setTimeout(() => onFinish(), 5200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {phase < 3 && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(158 45% 32%), hsl(158 45% 42%), hsl(180 40% 35%))" }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Background particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: "hsla(0,0%,100%,0.15)",
                left: `${10 + (i * 7) % 80}%`,
                top: `${15 + (i * 11) % 70}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + (i % 3),
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}

          {/* App Name - لمحة */}
          <motion.div
            className="text-center mb-6"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 150 }}
          >
            <h1
              className="text-5xl font-black text-white mb-1"
              style={{ textShadow: "0 4px 30px rgba(0,0,0,0.4)" }}
            >
              لمحة
            </h1>
          </motion.div>

          {/* Glasses looking left and right */}
          <motion.div
            className="text-5xl mb-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.span
              className="inline-block"
              animate={{
                rotateY: [0, 0, 180, 180, 0, 0],
                x: [0, 15, 15, -15, -15, 0],
              }}
              transition={{
                duration: 3,
                delay: 0.8,
                ease: "easeInOut",
                times: [0, 0.2, 0.3, 0.6, 0.7, 1],
              }}
            >
              👓
            </motion.span>
          </motion.div>

          {/* Phone icon */}
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 200 }}
          >
            <div className="w-16 h-26 rounded-2xl border-[3px] border-white/90 flex items-center justify-center relative bg-white/10 backdrop-blur-sm p-6">
              <div className="w-6 h-1 rounded-full bg-white/40 absolute top-2" />
              <div className="text-xl">📱</div>
              <div className="w-4 h-4 rounded-full bg-white/30 absolute bottom-2" />
            </div>
          </motion.div>

          {/* Flying messages */}
          {phase >= 1 && (
            <>
              {[
                { delay: 0, x: 120, y: -80, rotate: 15 },
                { delay: 0.15, x: -110, y: -100, rotate: -20 },
                { delay: 0.3, x: 90, y: -140, rotate: 10 },
                { delay: 0.45, x: -80, y: -60, rotate: -10 },
                { delay: 0.6, x: 140, y: -120, rotate: 25 },
              ].map((msg, i) => (
                <motion.div
                  key={i}
                  className="absolute text-3xl"
                  style={{ top: "58%", left: "50%" }}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                  animate={{
                    x: msg.x,
                    y: msg.y,
                    scale: [0, 1.3, 1],
                    opacity: [0, 1, 1, 0.6],
                    rotate: msg.rotate,
                  }}
                  transition={{ duration: 0.8, delay: msg.delay, ease: "easeOut" }}
                >
                  ✉️
                </motion.div>
              ))}

              {[
                { delay: 0.5, x: 100, y: -160, emoji: "👤" },
                { delay: 0.65, x: -90, y: -180, emoji: "👥" },
                { delay: 0.8, x: 60, y: -200, emoji: "👤" },
              ].map((p, i) => (
                <motion.div
                  key={`p-${i}`}
                  className="absolute text-2xl"
                  style={{ top: "58%", left: "50%" }}
                  initial={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                  transition={{ duration: 0.4, delay: p.delay + 0.3 }}
                >
                  {p.emoji}
                </motion.div>
              ))}
            </>
          )}

          {/* Tagline */}
          {phase >= 2 && (
            <motion.div
              className="mt-10 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.h2
                className="text-2xl font-bold text-white/90"
                style={{ textShadow: "0 2px 15px rgba(0,0,0,0.3)" }}
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.5, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                إعلانك يوصل
              </motion.h2>
              <motion.p
                className="text-white/60 text-sm font-medium mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                أوصل عرضك لكل الناس
              </motion.p>
            </motion.div>
          )}

          {/* Ripple effect */}
          {phase >= 1 && (
            <>
              {[0, 0.4, 0.8].map((delay, i) => (
                <motion.div
                  key={`r-${i}`}
                  className="absolute rounded-full border-2 border-white/20"
                  style={{ top: "58%", left: "calc(50% - 10px)" }}
                  initial={{ width: 20, height: 20, opacity: 0.6 }}
                  animate={{
                    width: [20, 250],
                    height: [20, 250],
                    x: [-10, -125],
                    y: [-10, -125],
                    opacity: [0.5, 0],
                  }}
                  transition={{ duration: 1.5, delay, repeat: 1, ease: "easeOut" }}
                />
              ))}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
