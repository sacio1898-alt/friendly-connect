import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Content protection: disable copy, cut, context menu for users
document.addEventListener('copy', (e) => e.preventDefault());
document.addEventListener('cut', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Disable pinch zoom
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());

createRoot(document.getElementById("root")!).render(<App />);
