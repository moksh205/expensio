import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Calendar, Clock, 
  Utensils, Bike, ShoppingCart, Receipt, 
  Plus, Coffee, Package, MoreHorizontal, Trash2, X 
} from 'lucide-react';

export default function Home({ expenses = [], onDelete, username }) {
  const [selectedId, setSelectedId] = useState(null); // Tracks which item shows the delete box

  const today = new Date().toISOString().split("T")[0];
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
    const d = new Date(e.date);
    return (d.getMonth() === currentMonth && d.getFullYear() === currentYear) ? sum + e.amount : sum;
  }, 0);

  const todayTotal = expenses
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);

  const recentTransactions = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#050505] text-white px-5 py-8 pb-28 font-sans max-w-md mx-auto border-x border-white/[0.02] relative">
      
      {/* Background Glows */}
      <div className="fixed top-[-5%] left-[-5%] w-[80%] h-[25%] bg-indigo-600/10 blur-[80px] rounded-full -z-10" />

      {/* Header */}
      <header className="flex justify-between items-center mb-10 px-1">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black mb-0.5">Overview</p>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Expensio.</h1>
        </div>
       <Link to="/profile">
  <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-xs font-black text-gray-400 hover:bg-white/10 transition">
    {username ? username.slice(0, 2).toUpperCase() : "U"}
  </div>
</Link>
      </header>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 p-7 rounded-[2.5rem] mb-6 shadow-2xl relative overflow-hidden">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-3 flex items-center gap-2">
          <Calendar size={12} className="text-indigo-500" /> Current Month
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-light text-indigo-500">₹</span>
          <h2 className="text-5xl font-bold tracking-tighter">{monthlyTotal.toLocaleString('en-IN')}</h2>
        </div>
        <TrendingUp size={100} className="absolute top-4 -right-2 text-white/5 -rotate-12" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[2rem]">
          <p className="text-[9px] uppercase tracking-widest text-gray-600 font-black mb-1">Today</p>
          <p className="text-2xl font-bold text-emerald-500 tracking-tight">₹{todayTotal}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[2rem]">
          <p className="text-[9px] uppercase tracking-widest text-gray-600 font-black mb-1">Entries</p>
          <p className="text-2xl font-bold text-gray-300 tracking-tight">{expenses.length}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <section>
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 flex items-center gap-2">
            <Clock size={14} className="text-indigo-500/50" /> Recent Logs
          </h2>
          {/* <button onClick={() => setView('history')} className="text-[10px] font-black uppercase tracking-widest text-indigo-500">View All</button> */}
        </div>

        <div className="space-y-3">
          <AnimatePresence mode='popLayout'>
            {recentTransactions.map((item) => {
              const isSelected = selectedId === item.id;
              const categoryData = categoryIcons[item.category] || categoryIcons.Other;
              
              return (
                <div key={item.id} className="relative">
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    /* Click to toggle the delete button */
                    onClick={() => setSelectedId(isSelected ? null : item.id)}
                    className={`bg-white/[0.02] border border-white/5 p-4 rounded-[1.8rem] flex justify-between items-center transition-all cursor-pointer ${isSelected ? 'border-indigo-500/30 bg-indigo-500/5' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-[1.2rem] flex items-center justify-center ${categoryData.color}`}>
                        {categoryData.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-200 leading-tight">{item.note || item.category}</p>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mt-0.5">
                          {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold tracking-tight text-white">₹{item.amount}</p>
                    </div>
                  </motion.div>

                  {/* 🔹 The Delete Box Overlay - Only shows when isSelected is true */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-md rounded-[1.8rem] flex items-center justify-between px-6 z-10 border border-red-500/20"
                      >
                        <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Delete entry?</p>
                        <div className="flex gap-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                            className="p-2 rounded-xl bg-white/5 text-gray-400"
                          >
                            <X size={18} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); setSelectedId(null); }}
                            className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Confirm
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}