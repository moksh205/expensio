import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

const STYLES = {
  success: { icon: CheckCircle2, color: "text-cash" },
  warning: { icon: AlertTriangle, color: "text-red-500" },
  info: { icon: Info, color: "text-accent" },
};

// 🔹 One toast look for the whole app
export default function Toast({ show, message, sub, type = "success" }) {
  const { icon: Icon, color } = STYLES[type] || STYLES.info;

  return (
    <div className="fixed inset-x-0 z-[100] flex justify-center px-4 pointer-events-none" style={{ top: "calc(env(safe-area-inset-top) + 1rem)" }}>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.15 } }}
            role="status"
            className="glass shadow-card w-full max-w-xs rounded-full pl-3 pr-5 py-2.5 flex items-center gap-3"
          >
            <span className={`w-8 h-8 shrink-0 rounded-full bg-surface flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-fg truncate">{message}</p>
              {sub && <p className="text-xs text-muted truncate">{sub}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
