import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 🔹 Flips the "dark" class on <html> and remembers the choice
export default function ThemeToggle({ className = "" }) {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next ? "#000000" : "#f7f6f2");
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // storage blocked → theme still works for this visit
    }
    setIsDark(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`glass w-11 h-11 rounded-full text-muted hover:text-fg flex items-center justify-center transition-colors active:scale-95 overflow-hidden ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
