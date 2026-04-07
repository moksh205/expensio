import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, Bike, ShoppingCart, Receipt, 
  Plus, Coffee, Package, MoreHorizontal, Calendar, 
  ChevronRight, ChevronLeft, Trash2, Clock,
  ShoppingBag, Fuel, Pill, Ticket, Filter,
  CreditCard, Wallet
} from "lucide-react";
import SEO from '../components/SEO';

export default function History({ expenses = [], onDelete }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
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
    Grocery: { icon: <ShoppingBag size={14} />, color: "text-teal-400 bg-teal-500/10" },
    Fuel: { icon: <Fuel size={14} />, color: "text-amber-400 bg-amber-500/10" },
    Health: { icon: <Pill size={14} />, color: "text-rose-400 bg-rose-500/10" },
    Entertainment: { icon: <Ticket size={14} />, color: "text-cyan-400 bg-cyan-500/10" },
    Other: { icon: <MoreHorizontal size={14} />, color: "text-gray-400 bg-gray-500/10" },
  };

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const categories = ["All", ...Object.keys(categoryIcons)];

  const normalizeCategory = (exp) => {
    if (!exp) return "Other"; 
    
    const safeCategory = String(exp.category || "").trim();
    const safeNote = String(exp.note || "").trim();
    const text = `${safeCategory} ${safeNote}`.toLowerCase();

    if (text.includes("blinkit")) return "Blinkit";
    if (text.includes("zomato")) return "Zomato";
    if (text.includes("juice") || text.includes("coconut") || text.includes("drink") || text.includes("tea")) return "Juice";
    if (text.includes("ride") || text.includes("metro") || text.includes("uber") || text.includes("rapido")) return "Ride";
    if (text.includes("bill") || text.includes("electric") || text.includes("recharge") || text.includes("wifi")) return "Bills";
    if (text.includes("shopping") || text.includes("amazon") || text.includes("flipkart") || text.includes("cloth")) return "Shopping";
    if (text.includes("food") || text.includes("meal") || text.includes("lunch") || text.includes("dinner")) return "Food";
    if (text.includes("grocer") || text.includes("supermarket")) return "Grocery";
    if (text.includes("fuel") || text.includes("petrol") || text.includes("diesel")) return "Fuel";
    if (text.includes("health") || text.includes("medic") || text.includes("doctor") || text.includes("pill")) return "Health";
    if (text.includes("movie") || text.includes("ticket") || text.includes("entertain") || text.includes("show")) return "Entertainment";

    const fallback = safeCategory ? safeCategory.charAt(0).toUpperCase() + safeCategory.slice(1).toLowerCase() : "Other";
    return categoryIcons[fallback] ? fallback : "Other";
  };

  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const processedExpenses = useMemo(() => {
    return safeExpenses.reduce((acc, exp) => {
      const raw = exp?.created_at || exp?.date;
      if (!raw) return acc;

      const d = new Date(raw);
      if (isNaN(d.getTime())) return acc;

      const localDate = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
      const normalized = normalizeCategory(exp);

      acc.push({ ...exp, localDate, normalized });
      return acc;
    }, []);
  }, [safeExpenses]);

  const filteredExpenses = useMemo(() => {
    return processedExpenses.filter(exp => {
      const matchesMonth = exp.localDate.getMonth() === selectedMonth && exp.localDate.getFullYear() === selectedYear;
      const matchesCategory = activeCategory === "All" || exp.normalized === activeCategory;
      
      const expPaymentMethod = exp.payment_method || "Online";
      const matchesPayment = paymentFilter === "All" || expPaymentMethod === paymentFilter;

      return matchesMonth && matchesCategory && matchesPayment;
    });
  }, [processedExpenses, selectedMonth, selectedYear, activeCategory, paymentFilter]);

  const grouped = useMemo(() => {
    return filteredExpenses.reduce((acc, exp) => {
      const d = exp.localDate;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      if (!acc[key]) acc[key] = { items: [], total: 0 };
      acc[key].items.push(exp);
      acc[key].total += (Number(exp.amount) || 0);

      return acc;
    }, {});
  }, [filteredExpenses]);

  const dates = useMemo(() => Object.keys(grouped).sort().reverse(), [grouped]);
  const monthTotal = useMemo(() => filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0), [filteredExpenses]);

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
    <div className="min-h-screen bg-[#050505] text-white px-5 py-10 pb-32 max-w-md mx-auto font-sans relative overflow-x-hidden">
      <SEO 
        title="History - Expensio" 
        description="View and analyze your expense history with smart filters." 
      />
      <div className="fixed top-[-5%] left-[-10%] w-[70%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center mb-8 px-1">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-black mb-0.5">Timeline</p>
          <h1 className="text-3xl font-black italic bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Activity.</h1>
        </div>
        <div className="bg-[#0c0c0c] border border-white/5 px-4 py-2.5 rounded-2xl text-right shadow-xl">
          <p className="text-[8px] uppercase tracking-widest text-indigo-400 font-black mb-0.5">Filtered Total</p>
          <p className="text-xl font-black tracking-tight">₹{monthTotal.toLocaleString('en-IN')}</p>
        </div>
      </header>

      {/* --- UNIFIED CONTROL CENTER --- */}
      <div className="mb-10 space-y-5">
        
        {/* Month Selector */}
        <section>
          <div className="flex items-center justify-between bg-[#0c0c0c] border border-white/5 p-1.5 rounded-full mx-auto shadow-lg max-w-[260px]">
            <button onClick={() => handleMonthChange("prev")} className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-90">
              <ChevronLeft size={18} />
            </button>
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <h3 className="text-xs font-black tracking-[0.2em] uppercase text-white">{months[selectedMonth]}</h3>
              <p className="text-[9px] font-bold text-gray-400 tracking-widest">{selectedYear}</p>
            </div>
            <button onClick={() => handleMonthChange("next")} className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-90">
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

        {/* PREMIUM SLIDING PAYMENT FILTER */}
        <section className="px-1">
          <div className="relative flex p-1 bg-[#0c0c0c] border border-white/5 rounded-2xl shadow-inner">
            {["All", "Online", "Cash"].map(method => {
              const isActive = paymentFilter === method;
              return (
                <button
                  key={method}
                  onClick={() => {
                    setPaymentFilter(method);
                    setSelectedId(null);
                  }}
                  className={`relative flex-1 flex justify-center items-center gap-1.5 py-3 text-[10px] font-black uppercase tracking-[0.2em] z-10 transition-colors duration-300 ${
                    isActive ? "text-black" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePaymentTab"
                      className="absolute inset-0 bg-white rounded-xl -z-10 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {method === "Online" && <CreditCard size={12} className={isActive ? "text-black" : "text-gray-600"} />}
                  {method === "Cash" && <Wallet size={12} className={isActive ? "text-black" : "text-gray-600"} />}
                  {method}
                </button>
              );
            })}
          </div>
        </section>

        {/* Category Filters (Sleek Chips) */}
        <section>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
            {categories.map(cat => {
              const isAll = cat === "All";
              const icon = isAll ? <Filter size={14} /> : categoryIcons[cat].icon;
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setSelectedId(null); 
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shadow-sm ${
                    isActive 
                    ? "bg-white/10 text-white border-white/20 shadow-white/5" 
                    : "bg-[#0c0c0c] border-white/5 text-gray-500 hover:bg-white/5 hover:text-gray-300"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-gray-600"}>{icon}</span>
                  {cat}
                </button>
              );
            })}
          </div>
        </section>
      </div>
      {/* --- END CONTROL CENTER --- */}

      {/* Transactions List */}
      <div className="w-full">
        <AnimatePresence mode="popLayout">
          {dates.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-10">
               <div className="w-16 h-16 bg-[#0c0c0c] rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-xl">
                  <Calendar size={24} className="text-gray-700" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                 No logs found
               </p>
            </motion.div>
          ) : (
            <motion.div key="list" className="space-y-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {dates.map(date => {
                const [y, m, d] = date.split("-");
                const displayDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));

                if (isNaN(displayDate.getTime())) return null;

                return (
                  <motion.div layout key={date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    
                    {/* Date Group Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                          {displayDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                      <span className="text-[10px] font-bold text-gray-400 font-mono tracking-tighter">
                        ₹{grouped[date].total.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Date Items */}
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {grouped[date].items.map((item) => {
                          const categoryData = categoryIcons[item.normalized] || categoryIcons.Other;
                          
                          // Universal stable ID for mapping, selection, and deletion
                          const stableId = item.id || item.created_at || item.date;
                          const isSelected = selectedId === stableId;
                          
                          return (
                            <motion.div
                              layout
                              key={stableId}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.85 }} 
                              className="relative overflow-hidden rounded-[1.8rem]"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (typeof onDelete === 'function') {
                                    onDelete(stableId);
                                  }
                                  setSelectedId(null);
                                }}
                                className="absolute right-0 inset-y-0 w-20 bg-red-600 flex items-center justify-center text-white active:bg-red-700 transition-colors z-0"
                              >
                                <Trash2 size={20} />
                              </button>

                              <motion.div
                                layout
                                animate={{ x: isSelected ? -80 : 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                onClick={() => setSelectedId(isSelected ? null : stableId)}
                                className={`relative z-10 bg-[#0c0c0c] border border-white/[0.05] p-4 flex justify-between items-center cursor-pointer active:bg-white/[0.02] transition-colors ${isSelected ? 'border-red-500/30' : ''}`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`p-2.5 rounded-2xl ${categoryData.color} transition-transform duration-300 ${isSelected ? 'scale-90' : ''}`}>
                                    {categoryData.icon}
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm tracking-tight leading-tight">
                                      {item.note || item.normalized}
                                    </p>
                                    
                                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1 flex items-center gap-1">
                                      <Clock size={8} /> 
                                      {item.localDate.toLocaleTimeString("en-IN", {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                      <span className="mx-1">•</span>
                                      <span className="text-indigo-400">
                                        {item.payment_method || "Online"}
                                      </span>
                                    </p>

                                  </div>
                                </div>
                                <div className={`text-right transition-all duration-300 ${isSelected ? 'opacity-0 scale-50' : 'opacity-100'}`}>
                                  <p className="font-black text-white text-base">₹{(Number(item.amount) || 0).toLocaleString('en-IN')}</p>
                                </div>
                              </motion.div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        /* 🔥 THE FIX: Strictly forces the browser to hide horizontal scrollbars globally */
        html, body { 
          overflow-x: hidden; 
        }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}