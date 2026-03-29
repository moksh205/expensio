import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  TrendingUp, Clock, 
  Utensils, Bike, ShoppingCart, Receipt, 
  Plus, Coffee, Package, MoreHorizontal, Trash2, Award
} from 'lucide-react';

const AnimatedNumber = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => 
    Math.round(latest).toLocaleString("en-IN")
  );

  useEffect(() => {
    const controls = animate(count, value, { 
      duration: 0.8, 
      ease: [0.16, 1, 0.3, 1] 
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

export default function Home({ expenses = [], onDelete, username }) {
  const [selectedId, setSelectedId] = useState(null);
  const [showTotal, setShowTotal] = useState(false);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const categoryIcons = {
    Food: { icon: <Utensils size={18} />, color: "text-orange-400 bg-orange-500/10", bar: "bg-orange-500" },
    Ride: { icon: <Bike size={18} />, color: "text-blue-400 bg-blue-500/10", bar: "bg-blue-500" },
    Blinkit: { icon: <Package size={18} />, color: "text-yellow-400 bg-yellow-500/10", bar: "bg-yellow-500" },
    Zomato: { icon: <Plus size={18} />, color: "text-red-400 bg-red-500/10", bar: "bg-red-500" },
    Shopping: { icon: <ShoppingCart size={18} />, color: "text-purple-400 bg-purple-500/10", bar: "bg-purple-500" },
    Bills: { icon: <Receipt size={18} />, color: "text-emerald-400 bg-emerald-500/10", bar: "bg-emerald-500" },
    Juice: { icon: <Coffee size={18} />, color: "text-pink-400 bg-pink-500/10", bar: "bg-pink-500" },
    Other: { icon: <MoreHorizontal size={18} />, color: "text-gray-400 bg-gray-500/10", bar: "bg-gray-500" },
  };

  const normalizeCategory = (exp) => {
    const text = `${exp.category || ""} ${exp.note || ""}`.toLowerCase();
    if (text.includes("blinkit")) return "Blinkit";
    if (text.includes("zomato")) return "Zomato";
    if (text.includes("juice") || text.includes("coconut") || text.includes("drink")) return "Juice";
    if (text.includes("ride") || text.includes("metro") || text.includes("uber")) return "Ride";
    if (text.includes("bill") || text.includes("electric") || text.includes("rent") || text.includes("recharge") || text.includes("internet") || text.includes("wifi")) return "Bills";
    if (text.includes("shopping") || text.includes("cloth") || text.includes("amazon") || text.includes("flipkart")) return "Shopping";
    if (text.includes("food") || text.includes("meal") || text.includes("lunch") || text.includes("dinner")) return "Food";
    return "Other";
  };

  const monthlyTotal = expenses.reduce((sum, e) => {
    const d = new Date(e.created_at || e.date);
    return (d.getMonth() === currentMonth && d.getFullYear() === currentYear)
      ? sum + Number(e.amount) : sum;
  }, 0);

  const overallTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const todayTotal = expenses.reduce((sum, e) => {
    const d = new Date(e.created_at || e.date);
    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    return isToday ? sum + Number(e.amount) : sum;
  }, 0);

  // 🔥 PERFECT TOP SPENDING (REAL + CLEAN GROUPING)
  const noteTotals = expenses.reduce((acc, exp) => {
    const d = new Date(exp.created_at || exp.date);

    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      let raw = (exp.note || "").toString().trim().toLowerCase();

      // ❌ Ignore ONLY exact generic entries
      const ignoreWords = ["food", "ride", "zomato", "blinkit", "shopping", "bills", "juice", "other"];
      if (!raw || ignoreWords.includes(raw)) return acc;

      // ✅ SMART GROUPING
      let key = raw;
      if (raw.includes("electric") || raw.includes("light bill")) key = "electricity";
      else if (raw.includes("cloth")) key = "clothes";
      else if (raw.includes("rent")) key = "rent";
      else if (raw.includes("grocery") || raw.includes("grocer")) key = "grocery";
      else if (raw.includes("fuel") || raw.includes("petrol") || raw.includes("diesel")) key = "fuel";
      else if (raw.includes("wifi") || raw.includes("internet") || raw.includes("broadband")) key = "internet";
      else if (raw.includes("recharge")) key = "recharge";

      acc[key] = (acc[key] || 0) + Number(exp.amount);
    }
    return acc;
  }, {});

  // ✅ Get top REAL item
  let topItemEntry = Object.entries(noteTotals)
    .filter(([_, val]) => val > 0)
    .sort((a, b) => b[1] - a[1])[0] || null;

  // 🔥 SANITY CHECK FALLBACK
  const categoryTotals = expenses.reduce((acc, exp) => {
    const d = new Date(exp.created_at || exp.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      const normalized = normalizeCategory(exp);
      acc[normalized] = (acc[normalized] || 0) + Number(exp.amount);
    }
    return acc;
  }, {});

  const topCategoryEntry = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0] || null;

  // 🔥 THE FIX: Never allow the generic "Other" bucket to overwrite a typed note!
  const isCategoryBigger = topCategoryEntry && topItemEntry && topCategoryEntry[1] > topItemEntry[1];
  const isNotOtherBucket = topCategoryEntry && topCategoryEntry[0] !== "Other";

  // Override only if we have NO items at all, OR if a valid category (like Food) beats our top item
  if (!topItemEntry || (isCategoryBigger && isNotOtherBucket)) {
    topItemEntry = topCategoryEntry;
  }

  // Percentage & Name Formatting
  let topItemPercentage = 0;
  let displayPercentage = "0%";

  if (topItemEntry && monthlyTotal > 0) {
    const rawPercentage = (topItemEntry[1] / monthlyTotal) * 100;
    topItemPercentage = Math.round(rawPercentage);
    
    if (topItemPercentage === 0 && rawPercentage > 0) {
      displayPercentage = "<1%";
    } else {
      displayPercentage = `${topItemPercentage}%`;
    }
  }

  const displayTopName = topItemEntry 
    ? topItemEntry[0].charAt(0).toUpperCase() + topItemEntry[0].slice(1) 
    : "";

  const recentTransactions = [...expenses]
    .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#050505] text-white px-5 py-8 pb-28 font-sans max-w-md mx-auto relative overflow-hidden">
      <div className="fixed top-[-5%] left-[-10%] w-[70%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center mb-10 px-1">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-600 font-black mb-0.5">Dashboard</p>
          <h1 className="text-2xl font-black italic bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Expensio.</h1>
        </div>
        <Link to="/profile" className="active:scale-90 transition-transform">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-xs font-black shadow-xl text-indigo-400 uppercase">
            {username ? username.slice(0, 2) : "GU"}
          </div>
        </Link>
      </header>

      {/* Toggle Card */}
      <motion.div
        onClick={() => setShowTotal(!showTotal)}
        whileTap={{ scale: 0.96 }}
        className="relative bg-[#0c0c0c] border border-white/5 p-8 rounded-[2.8rem] mb-6 overflow-hidden cursor-pointer shadow-2xl group"
      >
        <div className={`absolute inset-0 transition-opacity duration-700 opacity-40 ${showTotal ? 'bg-gradient-to-br from-emerald-600/20 via-transparent' : 'bg-gradient-to-br from-indigo-600/20 via-transparent'}`} />
        <div className="relative z-10 text-center">
          <div className="flex justify-between items-start mb-4">
             <div className="px-3 py-1.5 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/80 font-black">
                  {showTotal ? "Lifetime Burn" : "Monthly Burn"}
                </p>
             </div>
             <motion.div animate={{ rotate: showTotal ? 180 : 0 }} className="text-indigo-500/40"><TrendingUp size={20} /></motion.div>
          </div>
          <div className="flex items-baseline justify-center gap-1 mt-2">
            <span className="text-2xl font-light text-gray-500">₹</span>
            <h2 className="text-6xl font-black tracking-tighter tabular-nums">
              <AnimatedNumber value={showTotal ? overallTotal : monthlyTotal} />
            </h2>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[2.5rem] flex flex-col justify-between h-28 shadow-sm">
          <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">Today</p>
          <p className="text-2xl font-black text-emerald-400">₹{todayTotal.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[2.5rem] flex flex-col justify-between h-28 shadow-sm">
          <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">Logs</p>
          <p className="text-2xl font-black text-white">{expenses.length}</p>
        </div>

        {/* 🔥 Top Spending Card */}
        {topItemEntry && (() => {
          const normalized = normalizeCategory({ 
            category: topItemEntry[0], 
            note: topItemEntry[0] || "" 
          });
          const categoryData = categoryIcons[normalized] || categoryIcons.Other;

          return (
            <div className="col-span-2 bg-gradient-to-r from-white/[0.02] to-white/[0.05] border border-white/5 p-6 rounded-[2.5rem] flex flex-col justify-between shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${categoryData.color}`}>
                    {categoryData.icon}
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-gray-600 font-black flex items-center gap-1">
                      <Award size={10} className="text-indigo-500" /> Top Spending
                    </p>
                    <p className="font-bold text-white tracking-tight truncate max-w-[140px]">
                       {displayTopName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-white text-xl tracking-tight">₹{topItemEntry[1].toLocaleString("en-IN")}</p>
                  <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{displayPercentage} Contribution</p>
                </div>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${topItemPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${categoryData.bar}`} 
                />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Recent Activity */}
      <div className="flex justify-between items-center mb-6 px-1">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">Timeline</h2>
        <Link to="/history" className="px-3 py-1 bg-indigo-500/5 text-[9px] uppercase tracking-widest text-indigo-500 font-black rounded-lg border border-indigo-500/10 active:scale-95 transition-transform">View All</Link>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {recentTransactions.map((item) => {
            const normalized = normalizeCategory(item);
            const categoryData = categoryIcons[normalized] || categoryIcons.Other;
            const isSelected = selectedId === item.id;

            return (
              <motion.div key={item.id} layout className="relative overflow-hidden rounded-[1.8rem]">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); setSelectedId(null); }}
                  className="absolute right-0 inset-y-0 w-20 bg-red-600 flex items-center justify-center text-white active:bg-red-700"
                >
                  <Trash2 size={20} />
                </button>

                <motion.div
                  animate={{ x: isSelected ? -80 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  onClick={() => setSelectedId(isSelected ? null : item.id)}
                  className="relative z-10 bg-[#0c0c0c] border border-white/[0.05] p-4 flex justify-between items-center cursor-pointer active:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-2xl ${categoryData.color} transition-transform duration-300 ${isSelected ? 'scale-90' : ''}`}>
                      {categoryData.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{item.note || normalized}</p>
                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1 italic">
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
