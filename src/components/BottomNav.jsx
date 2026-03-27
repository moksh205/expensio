import { Link, useLocation } from "react-router-dom";
import { Home, Plus, BarChart3 } from "lucide-react"; // Install with: npm install lucide-react
import { motion } from "framer-motion"; // Install with: npm install framer-motion

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: <Home size={22} />, label: "Home" },
    { path: "/add", icon: <Plus size={24} />, label: "Add" },
    { path: "/history", icon: <BarChart3 size={22} />, label: "Stats" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[min(400px,90%)] z-50">
      <nav className="relative flex items-center justify-around bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] shadow-2xl shadow-black/50">
        
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative py-3 px-6 flex flex-col items-center justify-center transition-all duration-300"
            >
              {/* Active Background Glow/Pill */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 rounded-[2rem] border border-white/5"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 transition-transform duration-300 ${
                  isActive ? "text-indigo-400 scale-110" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {item.icon}
              </div>

              {/* Dot Indicator */}
              {isActive && (
                <motion.div 
                  layoutId="dot"
                  className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_8px_#818cf8]"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}