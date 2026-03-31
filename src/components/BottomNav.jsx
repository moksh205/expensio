import { Link, useLocation } from "react-router-dom";
import { Home, Plus, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: <Home size={22} /> },
    { path: "/add", icon: <Plus size={26} /> },
    { path: "/history", icon: <BarChart3 size={22} /> },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[360px] px-4 z-50">
      <nav className="flex items-center justify-between bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/5 p-2 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex-1 py-3.5 flex flex-col items-center justify-center outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-y-0 w-16 bg-gradient-to-tr from-indigo-500/20 to-indigo-500/5 rounded-[1.5rem] border border-indigo-500/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <div
                className={`relative z-10 transition-all duration-300 ${
                  isActive ? "text-indigo-400 scale-110" : "text-gray-400 hover:text-gray-400"
                }`}
              >
                {item.icon}
              </div>

              {isActive && (
                <motion.div 
                  layoutId="dot"
                  className="absolute bottom-1 w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_10px_#818cf8]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
