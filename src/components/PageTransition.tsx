import { ReactNode } from "react";

// Native-feel: instant page swap, zero animation delay.
// Removed framer-motion fade to eliminate the "web" feeling on ad open/back.
const PageTransition = ({ children }: { children: ReactNode }) => <>{children}</>;

export default PageTransition;
