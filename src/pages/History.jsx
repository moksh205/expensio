import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, Bike, ShoppingCart, Receipt, 
  Plus, Coffee, Package, MoreHorizontal, Calendar, 
  ChevronRight, ChevronLeft, Trash2, Clock
} from "lucide-react";

export default function History({ expenses = [], onDelete }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedId, setSelectedId] = useState(null);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const categoryIcons = {
    Food: { icon: <Utensils size={14} />, color: "text-orange-400 bg-orange-500/10" },
    Ride: { icon: <Bike size={14} />, color: "text-blue-400 bg-blue-500/10" },
    Blinkit: { icon: <Package size={14} />, color: "text-yellow-400 bg-yellow-500/10" },
    Zomato: { icon: <Plus size={14} />, color: "text-red-400 bg-red-500/10" },
    Shopping: { icon: <ShoppingCart size={14} />, color: "text-purple-400 bg-purple-500/10" },
    Bills: { icon: <Receipt size={14} />, color: "text-emerald-400 bg-emerald-500/10" },
    Juice: { icon: <Coffee size={14} />, color: "text-pink-400 bg-pink-500/10" },
    Other: { icon: <MoreHorizontal size={14} />, color: "text-gray-400 bg-gray-500/10" },
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const categories = ["All", ...Object.keys(categoryIcons)];

  // 🔥 FIXED: Bulletproof Date Parsing (Handles Supabase, LocalStorage, and UUIDs safely)
  const getDate = (exp) => {
    const rawDate = exp.created_at || exp.date || exp.id;
    const d = new Date(rawDate);
    return isNaN(d.getTime()) ? new Date() : d; // Prevent "Invalid Date" crashes
  };

  // 🔥 FIXED: Bulletproof Filtering (Case-insensitive & ignores accidental spaces)
  const filteredExpenses = expenses.filter(exp => {
    const d = getDate(exp);
    const categoryMatch = activeCategory === "All" || 
      (exp.category && exp.category.toString().toLowerCase().trim() === activeCategory.toLowerCase().trim());

    return (
      d.getMonth() === selectedMonth &&
      d.getFullYear() === selectedYear &&
      categoryMatch
    );
  });

  const grouped = filteredExpenses.reduce((acc, exp) => {
    const key = getDate(exp).toLocaleDateString("en-CA");
    if (!acc[key]) acc[key] = { items: [], total: 0 };
    acc[key].items.push(exp);
    acc[key].total += Number(exp.amount);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort().reverse();
  const monthTotal = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleMonthChange = (dir) => {
    if (dir === 'next') {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(prev => prev + 1);
      } else setSelectedMonth(prev => prev + 1);
    } else {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(prev => prev - 1);
      } else setSelectedMonth(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-10 pb-32 max-w-md mx-auto font-sans relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="fixed top-[-5%] left-[-10%] w-[70%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Activity.</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mt-1">Timeline</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl text-right">
          <p className="text-[8px] uppercase tracking-widest text-indigo-400 font-black">Monthly Burn</p>
          <p className="text-lg font-bold">₹{monthTotal.toLocaleString('en-IN')}</p>
        </div>
      </header>

      {/* Month Navigator */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6 px-2">
          <button onClick={() => handleMonthChange("prev")} className="text-gray-600 active:text-white p-2 bg-white/5 rounded-full transition-colors active:scale-90">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <h3 className="text-sm font-black tracking-widest uppercase">{months[selectedMonth]} {selectedYear}</h3>
            <div className="w-1 h-1 bg-indigo-500 rounded-full mx-auto mt-1" />
          </div>
          <button onClick={() => handleMonthChange("next")} className="text-gray-600 active:text-white p-2 bg-white/5 rounded-full transition-colors active:scale-90">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedId(null); // Close swiped items on filter change
              }}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                activeCategory === cat 
                ? "bg-white text-black border-white shadow-xl scale-95" 
                : "bg-white/[0.03] border-white/5 text-gray-500 active:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* List */}
      <div className="space-y-10">
        <AnimatePresence mode="popLayout">
          {dates.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
               <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Calendar size={24} className="text-gray-800" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">No logs found</p>
            </motion.div>
          ) : (
            dates.map(date => (
              <motion.div layout key={date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                    {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                  <div className="h-[1px] flex-1 bg-white/5" />
                  {/* Format Daily Total with Commas */}
                  <span className="text-[10px] font-bold text-gray-700 font-mono tracking-tighter">
                    ₹{grouped[date].total.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {grouped[date].items.map(item => {
                      const categoryData = categoryIcons[item.category] || categoryIcons.Other;
                      const isSelected = selectedId === item.id;
                      
                      return (
                        <motion.div
                          layout
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, x: -50, scale: 0.9 }}
                          className="relative overflow-hidden rounded-[1.8rem]"
                        >
                          {/* 🔹 Swipe-to-Delete Action (Match Home.jsx) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item.id);
                              setSelectedId(null);
                            }}
                            className="absolute right-0 inset-y-0 w-20 bg-red-600 flex items-center justify-center text-white active:bg-red-700 transition-colors z-0"
                          >
                            <Trash2 size={20} />
                          </button>

                          {/* 🔹 Foreground Card */}
                          <motion.div
                            layout
                            animate={{ x: isSelected ? -80 : 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                            onClick={() => setSelectedId(isSelected ? null : item.id)}
                            className={`relative z-10 bg-[#0c0c0c] border border-white/[0.05] p-4 flex justify-between items-center cursor-pointer active:bg-white/[0.02] transition-colors ${isSelected ? 'border-red-500/30' : ''}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-2.5 rounded-2xl ${categoryData.color} transition-transform duration-300 ${isSelected ? 'scale-90' : ''}`}>
                                {categoryData.icon}
                              </div>
                              <div>
                                <p className="font-bold text-sm tracking-tight leading-tight">
                                  {item.note || item.category}
                                </p>
                                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mt-1 flex items-center gap-1">
                                  <Clock size={8} /> {item.category}
                                </p>
                              </div>
                            </div>
                            <div className={`text-right transition-all duration-300 ${isSelected ? 'opacity-0 scale-50' : 'opacity-100'}`}>
                              <p className="font-black text-white text-base">₹{Number(item.amount).toLocaleString('en-IN')}</p>
                            </div>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
