import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2000);
    const t3 = setTimeout(() => setPhase(3), 3800);
    const t4 = setTimeout(() => setExiting(true), 4800);
    const t5 = setTimeout(() => onFinish(), 5600);
    return () => { [t1, t2, t3, t4, t5].forEach(clearTimeout); };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(160deg, hsl(158 50% 22%), hsl(158 45% 35%), hsl(170 40% 28%))" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Glow behind logo */}
          <motion.div
            className="absolute w-64 h-64 rounded-full"
            style={{ background: "radial-gradient(circle, hsla(158,50%,50%,0.25), transparent 70%)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Logo container */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Glasses icon */}
            <motion.div
              className="mb-4"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 180, delay: 0.2 }}
            >
              <motion.div
                className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                animate={{
                  boxShadow: [
                    "0 8px 32px rgba(0,0,0,0.3)",
                    "0 12px 48px rgba(0,0,0,0.4)",
                    "0 8px 32px rgba(0,0,0,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.span
                  className="text-4xl"
                  animate={{ x: [0, 6, -6, 0] }}
                  transition={{
                    duration: 2.5,
                    delay: 1,
                    ease: "easeInOut",
                    times: [0, 0.3, 0.7, 1],
                  }}
                >
                  👓
                </motion.span>
              </motion.div>
            </motion.div>

            {/* App name */}
            <motion.h1
              className="text-[44px] font-black text-white tracking-tight"
              style={{ textShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
            >
              لمحة
            </motion.h1>

            <motion.div
              className="h-[2px] w-12 bg-white/30 rounded-full my-3"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            />
          </motion.div>

          {/* Animated message flow */}
          {phase >= 1 && (
            <motion.div
              className="relative z-10 mt-4 h-28 w-full flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Central phone */}
              <motion.div
                className="relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="w-10 h-16 rounded-xl border-2 border-white/70 bg-white/10 backdrop-blur flex items-center justify-center">
                  <span className="text-sm">📱</span>
                </div>

                {/* Pulse rings */}
                {[0, 0.6, 1.2].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-xl border border-white/20"
                    animate={{
                      scale: [1, 2.5],
                      opacity: [0.4, 0],
                    }}
                    transition={{ duration: 1.5, delay, repeat: Infinity, ease: "easeOut" }}
                  />
                ))}
              </motion.div>

              {/* Flying envelopes */}
              {[
                { x: -80, y: -40, delay: 0.2, rotate: -15 },
                { x: 85, y: -35, delay: 0.4, rotate: 12 },
                { x: -60, y: 20, delay: 0.6, rotate: -8 },
                { x: 75, y: 25, delay: 0.8, rotate: 18 },
                { x: -100, y: -10, delay: 1.0, rotate: -22 },
                { x: 110, y: -5, delay: 1.2, rotate: 10 },
              ].map((env, i) => (
                <motion.div
                  key={i}
                  className="absolute text-xl"
                  initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                  animate={{
                    x: env.x,
                    y: env.y,
                    scale: [0, 1.2, 0.9],
                    opacity: [0, 1, 0.7],
                    rotate: env.rotate,
                  }}
                  transition={{ duration: 0.7, delay: env.delay, ease: "easeOut" }}
                >
                  ✉️
                </motion.div>
              ))}

              {/* People */}
              {[
                { x: -90, y: -50, delay: 0.8, emoji: "👤" },
                { x: 95, y: -45, delay: 1.0, emoji: "👤" },
                { x: -70, y: 30, delay: 1.2, emoji: "👥" },
                { x: 80, y: 35, delay: 1.4, emoji: "👤" },
              ].map((p, i) => (
                <motion.div
                  key={`p-${i}`}
                  className="absolute text-lg"
                  style={{ x: p.x, y: p.y }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                  transition={{ duration: 0.4, delay: p.delay }}
                >
                  {p.emoji}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Tagline */}
          {phase >= 2 && (
            <motion.div
              className="relative z-10 mt-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.p
                className="text-xl font-bold text-white/90"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
                initial={{ letterSpacing: "0.3em", opacity: 0 }}
                animate={{ letterSpacing: "0.05em", opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                إعلانك يوصل
              </motion.p>
              <motion.p
                className="text-white/50 text-[13px] mt-1.5 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                أوصل عرضك لكل الناس
              </motion.p>
            </motion.div>
          )}

          {/* Loading bar */}
          {phase >= 2 && (
            <motion.div
              className="absolute bottom-16 w-32 h-1 bg-white/10 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="h-full bg-white/50 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </motion.div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen;
