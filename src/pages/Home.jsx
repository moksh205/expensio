import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Calendar, Clock, 
  Utensils, Bike, ShoppingCart, Receipt, 
  Plus, Coffee, Package, MoreHorizontal, Trash2, X 
} from 'lucide-react';

export default function Home({ expenses = [], onDelete, username }) {
  // Track which item is swiped/selected for deletion
  const [selectedId, setSelectedId] = useState(null);

  const today = new Date().toLocaleDateString("en-CA");
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
    const d = new Date(e.created_at || e.id); // fallback to id for guests
    return (d.getMonth() === currentMonth && d.getFullYear() === currentYear)
      ? sum + Number(e.amount)
      : sum;
  }, 0);

  const todayTotal = expenses
    .filter((e) => {
      const d = new Date(e.created_at || e.id);
      return d.toLocaleDateString("en-CA") === today;
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const recentTransactions = [...expenses]
    .sort((a, b) => new Date(b.created_at || b.id) - new Date(a.created_at || a.id))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#050505] text-white px-5 py-8 pb-28 font-sans max-w-md mx-auto relative overflow-hidden">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black mb-0.5">Overview</p>
          <h1 className="text-2xl font-bold tracking-tight italic">Expensio.</h1>
        </div>

        <Link to="/profile" className="active:scale-90 transition-transform">
          <div className="w-12 h-12 rounded-[1.3rem] bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center text-xs font-black shadow-xl text-indigo-400">
            {username ? username.slice(0, 2).toUpperCase() : "GU"}
          </div>
        </Link>
      </header>

      {/* Main Card */}
      <div className="bg-gradient-to-br from-indigo-600/20 to-transparent border border-white/5 p-8 rounded-[2.5rem] mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <TrendingUp size={40} className="text-indigo-500" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-black mb-1">Spent this month</p>
        <h2 className="text-5xl font-black tracking-tighter">₹{monthlyTotal.toLocaleString('en-IN')}</h2>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-white/[0.03] border border-white/5 p-5 rounded-[1.8rem]">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Today</p>
          <p className="text-xl font-black text-emerald-400">₹{todayTotal}</p>
        </div>

        <div className="bg-white/[0.03] border border-white/5 p-5 rounded-[1.8rem]">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Total Logs</p>
          <p className="text-xl font-black text-white">{expenses.length}</p>
        </div>
      </div>

      {/* Recent Logs Section */}
      <div className="flex justify-between items-end mb-6 px-1">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">Recent Logs</h2>
        <Link to="/history" className="text-[10px] uppercase tracking-widest text-indigo-500 font-black">View All</Link>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {recentTransactions.map((item) => {
            const categoryData = categoryIcons[item.category] || categoryIcons.Other;
            const isSelected = selectedId === item.id;

            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative"
              >
                {/* Delete Button (Hidden behind) */}
                <button
                  onClick={() => {
                    onDelete(item.id);
                    setSelectedId(null);
                  }}
                  className="absolute right-0 inset-y-0 w-16 bg-red-500 flex items-center justify-center rounded-2xl text-white shadow-lg shadow-red-500/20"
                >
                  <Trash2 size={20} />
                </button>

                {/* Main Transaction Body */}
                <motion.div
                  animate={{ x: isSelected ? -70 : 0 }}
                  onClick={() => setSelectedId(isSelected ? null : item.id)}
                  className={`relative z-10 bg-[#0c0c0c] border border-white/[0.05] p-4 rounded-2xl flex justify-between items-center cursor-pointer transition-colors ${isSelected ? 'border-red-500/30' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${categoryData.color} transition-transform ${isSelected ? 'scale-90' : ''}`}>
                      {categoryData.icon}
                    </div>

                    <div>
                      <p className="font-bold text-sm tracking-tight">{item.note || item.category}</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                        <Clock size={10} />
                        {new Date(item.created_at || item.id).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short"
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-white">₹{item.amount}</p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {recentTransactions.length === 0 && (
          <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">No entries yet</p>
          </div>
        )}
      </div>
    </div>
  );
}