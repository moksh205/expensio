import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import { 
  TrendingUp, Clock, 
  Utensils, Bike, ShoppingCart, Receipt, 
  Plus, Coffee, Package, MoreHorizontal, Trash2
} from 'lucide-react';

// 🔹 Animated Counter Component
const AnimatedNumber = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => 
    latest.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })
  );

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.8, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

export default function Home({ expenses = [], onDelete, username }) {
  const [selectedId, setSelectedId] = useState(null);
  const [showTotal, setShowTotal] = useState(false);

  const todayStr = new Date().toLocaleDateString("en-CA");
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const categoryIcons = {
    Food: { icon: <Utensils size={18} />, color: "text-orange-400 bg-orange-500/10" },
    Ride: { icon: <Bike size={18} />, color: "text-blue-400 bg-blue-500/10" },
    Blinkit: { icon: <Package size={18} />, color: "text-yellow-400 bg-yellow-500/10" },
    Zomato: { icon: <Plus size={18} />, color: "text-red-400 bg-red-500/10" },
    Shopping: { icon: <ShoppingCart size={18} />, color: "text-purple-400 bg-purple-500/10" },
    Bills: { icon: <Receipt size={18} />, color: "text-emerald-400 bg-emerald-500/10" },
    Juice: { icon: <Coffee size={18} />, color: "text-pink-400 bg-pink-500/10" },
    Other: { icon: <MoreHorizontal size={18} />, color: "text-gray-400 bg-gray-500/10" },
  };

  const monthlyTotal = expenses.reduce((sum, e) => {
    const d = new Date(e.created_at || e.date);
    return (d.getMonth() === currentMonth && d.getFullYear() === currentYear)
      ? sum + Number(e.amount)
      : sum;
  }, 0);

  const overallTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const todayTotal = expenses
    .filter((e) => {
      const rawDate = e.created_at || e.date;
      if (!rawDate) return false;
      const d = new Date(rawDate);
      return d.toLocaleDateString("en-CA") === todayStr;
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const recentTransactions = [...expenses]
    .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#050505] text-white px-5 py-8 pb-28 font-sans max-w-md mx-auto relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="fixed top-[-5%] left-[-10%] w-[70%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full -z-10" />

      {/* Header */}
      <header className="flex justify-between items-center mb-10 px-1">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-600 font-black mb-0.5">Dashboard</p>
          <h1 className="text-2xl font-black italic bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Expensio.</h1>
        </div>

        <Link to="/profile" className="active:scale-90 transition-transform">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-xs font-black shadow-xl text-indigo-400">
            {username ? username.slice(0, 2).toUpperCase() : "GU"}
          </div>
        </Link>
      </header>

      {/* 🔥 THE UNIQUE TOGGLE CARD */}
      <motion.div
        onClick={() => setShowTotal(!showTotal)}
        whileTap={{ scale: 0.96 }}
        className="relative bg-[#0c0c0c] border border-white/5 p-8 rounded-[2.8rem] mb-10 overflow-hidden cursor-pointer shadow-2xl"
      >
        {/* Decorative Gradient Background */}
        <div className={`absolute inset-0 transition-opacity duration-700 opacity-40 ${showTotal ? 'bg-gradient-to-br from-emerald-600/20 via-transparent to-transparent' : 'bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent'}`} />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/60 font-black">
                {showTotal ? "Lifetime Burn" : "Monthly Burn"}
              </p>
            </div>
            <motion.div animate={{ rotate: showTotal ? 180 : 0 }} className="text-indigo-500/40">
               <TrendingUp size={20} />
            </motion.div>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-light text-gray-500">₹</span>
            <h2 className="text-5xl font-black tracking-tighter tabular-nums">
              <AnimatedNumber value={showTotal ? overallTotal : monthlyTotal} />
            </h2>
          </div>

          {/* New Switch Indicator Pill */}
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <div className="flex gap-1">
               <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${!showTotal ? 'bg-indigo-500 w-4' : 'bg-white/10'}`} />
               <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${showTotal ? 'bg-emerald-500 w-4' : 'bg-white/10'}`} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300/60">Tap to Toggle</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[2rem] flex flex-col justify-between h-28">
          <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">Today</p>
          <p className="text-2xl font-black text-emerald-400">₹{todayTotal.toLocaleString("en-IN")}</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[2rem] flex flex-col justify-between h-28">
          <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">Logs</p>
          <p className="text-2xl font-black text-white">{expenses.length}</p>
        </div>
      </div>

      {/* Recent Logs Section */}
      <div className="flex justify-between items-center mb-6 px-1">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">Timeline</h2>
        <Link to="/history" className="px-3 py-1 bg-indigo-500/5 text-[9px] uppercase tracking-widest text-indigo-500 font-black rounded-lg border border-indigo-500/10">View All</Link>
      </div>

      {/* Transactions */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {recentTransactions.map((item) => {
            const categoryData = categoryIcons[item.category] || categoryIcons.Other;
            const isSelected = selectedId === item.id;

            return (
              <motion.div key={item.id} layout className="relative overflow-hidden rounded-[1.8rem]">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); setSelectedId(null); }}
                  className="absolute right-0 inset-y-0 w-20 bg-red-600 flex items-center justify-center text-white"
                >
                  <Trash2 size={20} />
                </button>

                <motion.div
                  animate={{ x: isSelected ? -80 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  onClick={() => setSelectedId(isSelected ? null : item.id)}
                  className="relative z-10 bg-[#0c0c0c] border border-white/[0.05] p-4 flex justify-between items-center cursor-pointer active:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-2xl ${categoryData.color}`}>
                      {categoryData.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{item.note || item.category}</p>
                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
                        {new Date(item.created_at || item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                  <div className={`text-right transition-all duration-300 ${isSelected ? 'opacity-0 scale-50' : 'opacity-100'}`}>
                    <p className="font-black text-white">₹{Number(item.amount).toLocaleString("en-IN")}</p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
                    onDelete(item.id);
                    setSelectedId(null);
                  }}
                  className="absolute right-0 inset-y-0 w-20 bg-red-600 flex items-center justify-center text-white"
                >
                  <Trash2 size={20} />
                </button>

                {/* 🔹 Sliding Card Body */}
                <motion.div
                  animate={{ x: isSelected ? -80 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  onClick={() => setSelectedId(isSelected ? null : item.id)}
                  className="relative z-10 bg-[#0c0c0c] border border-white/[0.05] p-4 flex justify-between items-center cursor-pointer active:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${categoryData.color} transition-transform ${isSelected ? 'scale-90' : ''}`}>
                      {categoryData.icon}
                    </div>

                    <div>
                      <p className="font-bold text-sm tracking-tight">{item.note || item.category}</p>
                      <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                        <Clock size={10} />
                        {new Date(item.created_at || item.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className={`text-right transition-all ${isSelected ? 'opacity-0 scale-50' : 'opacity-100'}`}>
                    <p className="font-black text-white">₹{item.amount}</p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {recentTransactions.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
            <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">No recent transactions</p>
          </div>
        )}
      </div>
    </div>
  );
}
