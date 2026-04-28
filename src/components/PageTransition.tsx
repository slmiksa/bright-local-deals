import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useNavigationType } from "react-router-dom";

const PageTransition = ({ children }: { children: ReactNode }) => {
  const navType = useNavigationType();
  // Back/forward (POP) — render instantly, no fade. Feels native (iOS).
  if (navType === "POP") {
    return <>{children}</>;
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
