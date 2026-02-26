import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Initialize native features after render
import("./lib/capacitor").then(({ initNativeApp }) => initNativeApp());
