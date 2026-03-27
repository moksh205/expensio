import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, ArrowUpRight, Clock } from 'lucide-react';

export default function Home({ expenses = [] }) {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Calculations
  const monthlyTotal = expenses.reduce((sum, e) => {
    const d = new Date(e.date);
    return (d.getMonth() === currentMonth && d.getFullYear() === currentYear) ? sum + e.amount : sum;
  }, 0);

  const todayTotal = expenses
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);

  // Get most recent 5 transactions (not just grouped dates)
  const recentTransactions = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-24 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[70%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-5%] right-[-10%] w-[60%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full -z-10" />

      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-1">Welcome back</p>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            Expensio.
          </h1>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20"
        >
           <div className="w-full h-full rounded-[calc(1rem-1px)] bg-[#0a0a0a] flex items-center justify-center text-xs font-bold text-indigo-400">
             JD
           </div>
        </motion.div>
      </header>

      {/* Hero Monthly Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-white/[0.03] border border-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] mb-8 group"
      >
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-3 flex items-center gap-2">
              <Calendar size={12} className="text-indigo-400" /> This Month
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-light text-indigo-400">₹</span>
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-5xl font-bold tracking-tighter"
              >
                {monthlyTotal.toLocaleString('en-IN')}
              </motion.h2>
            </div>
          </div>
          <div className="bg-indigo-500/10 p-3 rounded-2xl text-indigo-400">
             <TrendingUp size={24} />
          </div>
        </div>

        {/* Decorative Wave/Graph SVG */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 100" className="w-full h-full">
            <path d="M0 80 Q 100 20 200 50 T 400 30" stroke="currentColor" fill="transparent" strokeWidth="2" className="text-indigo-400" />
          </svg>
        </div>
      </motion.div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <motion.div 
          whileHover={{ translateY: -5 }}
          className="bg-white/[0.03] border border-white/5 p-5 rounded-[2rem] hover:bg-white/[0.05] transition-all"
        >
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Today</p>
          <p className="text-2xl font-bold text-emerald-400 tracking-tight">₹{todayTotal}</p>
        </motion.div>

        <motion.div 
          whileHover={{ translateY: -5 }}
          className="bg-white/[0.03] border border-white/5 p-5 rounded-[2rem] hover:bg-white/[0.05] transition-all"
        >
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Logs</p>
          <p className="text-2xl font-bold text-gray-200 tracking-tight">{expenses.length}</p>
        </motion.div>
      </div>

      {/* List Section */}
      <section>
        <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-xs uppercase tracking-widest font-bold text-gray-500 flex items-center gap-2">
              <Clock size={14} /> Recent Activity
            </h2>
            <button className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
              View All
            </button>
        </div>

        <div className="space-y-4">
          {recentTransactions.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">No history yet</p>
            </div>
          ) : (
            recentTransactions.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={item.id || index}
                className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] p-4 rounded-[1.5rem] flex justify-between items-center transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                    {/* Placeholder for icon logic - could map item.category to Lucide icons */}
                    <ArrowUpRight size={18} className="text-gray-500 group-hover:text-indigo-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                      {item.note || item.category}
                    </span>
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                      {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                    ₹{item.amount}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}