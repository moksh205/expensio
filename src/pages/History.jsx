import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, Bike, ShoppingCart, Receipt, 
  Plus, Coffee, Package, MoreHorizontal, Calendar, 
  ChevronRight, ChevronLeft, Trash2 
} from "lucide-react";

export default function History({ expenses = [], onDelete }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const categoryIcons = {
    Food: <Utensils size={14} className="text-orange-400" />,
    Ride: <Bike size={14} className="text-blue-400" />,
    Blinkit: <Package size={14} className="text-yellow-400" />,
    Zomato: <Plus size={14} className="text-red-400" />,
    Shopping: <ShoppingCart size={14} className="text-purple-400" />,
    Bills: <Receipt size={14} className="text-emerald-400" />,
    Juice: <Coffee size={14} className="text-pink-400" />,
    Other: <MoreHorizontal size={14} className="text-gray-400" />,
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const categories = ["All", ...Object.keys(categoryIcons)];

  // 🔥 FILTER LOGIC (Handles Supabase ISO strings or guest IDs)
  const filteredExpenses = expenses.filter(exp => {
    const d = new Date(exp.created_at || exp.id);
    return d.getMonth() === selectedMonth && 
           d.getFullYear() === selectedYear && 
           (activeCategory === "All" || exp.category === activeCategory);
  });

  // 🔥 GROUP BY DATE
  const grouped = filteredExpenses.reduce((acc, exp) => {
    const dateKey = new Date(exp.created_at || exp.id).toISOString().split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = { items: [], total: 0 };
    acc[dateKey].items.push(exp);
    acc[dateKey].total += Number(exp.amount);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort().reverse();
  const monthTotal = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleMonthChange = (direction) => {
    if (direction === 'next') {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(prev => prev + 1);
      } else {
        setSelectedMonth(prev => prev + 1);
      }
    } else {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(prev => prev - 1);
      } else {
        setSelectedMonth(prev => prev - 1);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-10 pb-32 max-w-md mx-auto font-sans relative overflow-hidden">
      
      {/* 1. Header */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black mt-1">History & Logs</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl text-right">
            <p className="text-[8px] uppercase tracking-widest text-indigo-400 font-black">Total Spent</p>
            <p className="text-lg font-bold text-white">₹{monthTotal.toLocaleString('en-IN')}</p>
        </div>
      </header>

      {/* 2. Filter Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6 px-2">
          <button onClick={() => handleMonthChange('prev')} className="text-gray-600 hover:text-white transition-colors p-2 bg-white/5 rounded-full">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center group cursor-pointer">
            <h3 className="text-sm font-black tracking-wide uppercase">{months[selectedMonth]} {selectedYear}</h3>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mx-auto mt-1 animate-pulse" />
          </div>
          <button onClick={() => handleMonthChange('next')} className="text-gray-600 hover:text-white transition-colors p-2 bg-white/5 rounded-full">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat 
                ? "bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.1)] scale-95" 
                : "bg-white/[0.03] border border-white/5 text-gray-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Transaction List */}
      <div className="space-y-10">
        <AnimatePresence mode="popLayout">
          {dates.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
               <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Calendar size={24} className="text-gray-800" />
               </div>
               <p className="text-xs font-bold uppercase tracking-widest text-gray-600">No logs for this period</p>
            </motion.div>
          ) : (
            dates.map((date) => (
              <motion.div layout key={date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-4 mb-4 px-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                    {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                  <div className="h-[1px] flex-1 bg-white/5" />
                  <span className="text-[10px] font-black text-gray-500 tracking-tighter">TOTAL ₹{grouped[date].total}</span>
                </div>

                <div className="space-y-3">
                  {grouped[date].items.map((exp) => {
                    const isSelected = selectedId === exp.id;
                    return (
                      <div key={exp.id} className="relative overflow-hidden rounded-[1.8rem]">
                        
                        {/* 🔹 DELETE BUTTON (Always underneath) */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(exp.id); }}
                          className="absolute right-0 top-0 bottom-0 w-20 bg-red-600 flex items-center justify-center text-white z-10 active:bg-red-700 transition-colors shadow-inner"
                        >
                          <Trash2 size={20} />
                        </button>

                        {/* 🔹 SLIDING CARD */}
                        <motion.div
                          layout
                          onClick={() => setSelectedId(isSelected ? null : exp.id)}
                          animate={{ x: isSelected ? -80 : 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                          className={`relative z-20 bg-[#0c0c0c] border border-white/5 p-4 flex justify-between items-center cursor-pointer ${
                            isSelected ? "border-red-500/20" : ""
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center shadow-inner">
                              {categoryIcons[exp.category] || categoryIcons.Other}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-200 tracking-tight">{exp.note || exp.category}</p>
                              <p className="text-[9px] text-gray-600 uppercase font-black tracking-[0.15em] mt-0.5">{exp.category}</p>
                            </div>
                          </div>

                          {/* 🔹 AMOUNT */}
                          <div className={`transition-all duration-300 ${isSelected ? 'opacity-0 -translate-x-4' : 'opacity-100'}`}>
                            <span className="text-base font-black tracking-tight text-white">₹{exp.amount}</span>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
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