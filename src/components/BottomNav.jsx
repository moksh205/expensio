import { Link, useLocation } from "react-router-dom";
import { Home, Plus, BarChart3, User } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
  const location = useLocation();

  // Only on the 4 main tabs (hidden on login, reset, update password, 404)
  if (!["/", "/add", "/history", "/profile"].includes(location.pathname)) return null;

  const navItems = [
    { path: "/", label: "Home", Icon: Home },
    { path: "/history", label: "History", Icon: BarChart3 },
    { path: "/add", label: "Add", Icon: Plus, primary: true },
    { path: "/profile", label: "Profile", Icon: User },
  ];

  return (
    <div
      className="fixed inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <nav className="glass shadow-card pointer-events-auto w-full max-w-[380px] flex items-center justify-between rounded-full p-1.5">
        {navItems.map(({ path, label, Icon, primary }) => {
          const isActive = location.pathname === path;

          if (primary) {
            return (
              <Link key={path} to={path} aria-label="Add expense" className="flex-1 flex justify-center">
                <span className="w-14 h-12 rounded-full flex items-center justify-center bg-linear-to-br from-primary to-primary-2 text-on-primary shadow-card transition-transform active:scale-90">
                  <Icon size={24} strokeWidth={2.5} />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={path}
              to={path}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className="relative flex-1 min-h-12 flex flex-col items-center justify-center gap-0.5 rounded-full outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-accent-soft rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={20} className={`relative z-10 transition-colors ${isActive ? "text-accent" : "text-muted"}`} />
              <span className={`relative z-10 text-xs font-medium ${isActive ? "text-accent" : "text-muted"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
