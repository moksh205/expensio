import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Save, Trash2, Wallet, Database, 
  ShieldAlert, ChevronRight, LogOut, LogIn, CloudSync,
  CheckCircle2, AlertTriangle, Info, Download
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function Profile({ expenses = [], resetData, user, onLogout }) {
  const [name, setName] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [confirmState, setConfirmState] = useState({
    show: false,
    message: "",
    onConfirm: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (savedName) setName(savedName);
  }, []);

  useEffect(() => {
    const originalConfirm = window.confirm;

    window.confirm = (message) => {
      return new Promise((resolve) => {
        setConfirmState({
          show: true,
          message,
          onConfirm: resolve,
        });
      });
    };

    return () => {
      window.confirm = originalConfirm;
    };
  }, []);

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    localStorage.setItem("username", trimmedName);
    setName(trimmedName);
    triggerToast("Profile Updated", "success");
  };

  const handleLogoutAction = async () => {
    try {
      await onLogout();
      triggerToast("Logged Out Successfully", "info");
    } catch (err) {
      triggerToast("Logout Failed", "warning");
    }
  };

  const handleExportCSV = () => {
    if (!expenses || expenses.length === 0) {
      triggerToast("No data to export", "info");
      return;
    }

    try {
      const headers = ["Date", "Time", "Amount", "Category", "Note"];

      // 1. Pragmatic parser with manual +5.5 hour IST offset
      const parseDate = (raw) => {
        if (!raw) return new Date(NaN);
        const d = new Date(raw);
        if (isNaN(d.getTime())) return new Date(NaN);
        
        // Explicitly add 5.5 hours to correct the DB offset
        return new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
      };

      // 2. Sort chronologically 
      const sortedExpenses = [...expenses].sort(
        (a, b) => parseDate(b.created_at || b.date) - parseDate(a.created_at || a.date)
      );

      // 3. Map rows safely
      const rows = sortedExpenses.map((exp) => {
        const d = parseDate(exp.created_at || exp.date);

        const safeAmount = Number(exp.amount) || 0;
        const safeCategory = exp.category || "Other";
        const safeNote = `"${(exp.note || "").replace(/"/g, '""')}"`;

        // Graceful fallback for completely corrupt data
        if (isNaN(d.getTime())) {
          return ["Invalid Date", "--:--", safeAmount, safeCategory, safeNote];
        }

        return [
          d.toLocaleDateString("en-IN"),
          d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          safeAmount,
          safeCategory,
          safeNote
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      
      const dateString = new Date().toLocaleDateString("en-IN").replace(/\//g, '-');
      link.download = `expensio_${dateString}.csv`;
      
      link.click();
      
      // Prevent memory leaks
      URL.revokeObjectURL(link.href);

      triggerToast("CSV Downloaded", "success");
    } catch (err) {
      console.error(err);
      triggerToast("Export Failed", "warning");
    }
  };

  const total = expenses.reduce((sum, e) => {
    const amt = Number(e.amount);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const userIdentifier = user?.email || name || "Guest User";

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-10 pb-32 max-w-md mx-auto font-sans relative overflow-hidden">
      
      {/* 🔹 TOAST SYSTEM */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -100, x: "-50%" }}
            className="fixed top-6 left-1/2 z-[100] w-[90%] max-w-xs pointer-events-none"
          >
            <div className={`backdrop-blur-xl p-4 rounded-3xl flex items-center gap-3 border shadow-2xl ${
              toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/50 shadow-emerald-500/10" :
              toast.type === "warning" ? "bg-red-500/10 border-red-500/50 shadow-red-500/10" :
              "bg-indigo-500/10 border-indigo-500/50 shadow-indigo-500/10"
            }`}>
              <div className={`rounded-full p-1.5 ${
                toast.type === "success" ? "bg-emerald-500" :
                toast.type === "warning" ? "bg-red-500" : "bg-indigo-500"
              }`}>
                {toast.type === "success" && <CheckCircle2 size={16} className="text-black" />}
                {toast.type === "warning" && <AlertTriangle size={16} className="text-black" />}
                {toast.type === "info" && <Info size={16} className="text-black" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${
                  toast.type === "success" ? "text-emerald-400" :
                  toast.type === "warning" ? "text-red-400" : "text-indigo-400"
                }`}>{toast.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-[-5%] left-[-10%] w-[70%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full -z-10" />

      <header className="mb-10 text-center">
        <h1 className="text-3xl font-black italic tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-8">Profile.</h1>

        <div className="relative inline-block group">
          <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-indigo-600 to-emerald-500 p-[2px] shadow-2xl shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-500">
            <div className="w-full h-full rounded-[calc(2.5rem-2px)] bg-[#0a0a0a] flex items-center justify-center">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-indigo-400 to-emerald-400">
                {userIdentifier.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-500 rounded-xl border-4 border-[#050505] flex items-center justify-center shadow-lg">
            <ShieldAlert size={12} className="text-white" />
          </div>
        </div>

        <h2 className="mt-4 text-xl font-bold tracking-tight truncate px-4">{name || "Guest User"}</h2>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600 mt-1">
          {user ? "Authenticated" : "Local Storage Mode"}
        </p>
      </header>

      {/* 🔹 Auth Section */}
      <section className="mb-8">
        {!user ? (
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-white text-black p-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-white/5"
          >
            <LogIn size={18} /> Connect Cloud Sync
          </button>
        ) : (
          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-[1.8rem] flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 flex-shrink-0 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CloudSync size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-emerald-400">Cloud Sync Active</p>
                <p className="text-[10px] text-gray-500 font-medium truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogoutAction} 
              className="p-3 text-gray-600 hover:text-red-500 transition-colors active:scale-90 flex-shrink-0"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </section>

      {/* 🔹 Settings */}
      <section className="mb-10 space-y-4">
        <p className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Preferences</p>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#0c0c0c] border border-white/5 p-5 pr-16 rounded-[2rem] text-sm font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-800 shadow-inner"
          />
          <button
            onClick={handleSave}
            className="absolute right-2 p-3.5 bg-indigo-500 rounded-2xl text-white active:scale-90 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Save size={18} />
          </button>
        </div>
      </section>

      {/* 🔹 Bento Stats */}
      <section className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center group active:scale-95 transition-transform">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/5 flex items-center justify-center mb-3">
            <Wallet size={20} className="text-indigo-400" />
          </div>
          <p className="text-[9px] uppercase font-black tracking-widest text-gray-600 mb-1 text-center">Net Burn</p>
          <p className="text-xl font-black text-white">₹{total.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center group active:scale-95 transition-transform">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/5 flex items-center justify-center mb-3">
            <Database size={20} className="text-emerald-400" />
          </div>
          <p className="text-[9px] uppercase font-black tracking-widest text-gray-600 mb-1 text-center">Entries</p>
          <p className="text-xl font-black text-white">{expenses.length}</p>
        </div>
      </section>

      {/* 🔹 Export Data */}
      <section className="mb-10">
        <p className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-4">
          Data
        </p>

        <button
          onClick={handleExportCSV}
          className="w-full group bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] p-5 rounded-[2rem] flex items-center justify-between transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4 text-white">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Download size={18} className="text-indigo-400" />
            </div>
            <span className="text-sm font-bold">Export CSV</span>
          </div>
          <ChevronRight size={18} className="text-white/20" />
        </button>
      </section>

      {/* 🔹 Danger Zone */}
      <section>
        <p className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-4">Danger Zone</p>
        <button
          onClick={async () => {
            const confirmed = await window.confirm("Permanent Action: Erase all data and logs?");
            if (confirmed) {
              resetData();
              triggerToast("All Data Cleared", "warning");
            }
          }}
          className="w-full group bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 p-5 rounded-[2rem] flex items-center justify-between transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4 text-red-500">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Trash2 size={18} />
            </div>
            <span className="text-sm font-bold">Clear All Data</span>
          </div>
          <ChevronRight size={18} className="text-red-900/30" />
        </button>
      </section>

      <footer className="mt-16 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-800">Expensio Cloud • v1.0.4</p>
      </footer>

      {/* ✅ CUSTOM MODAL OVERLAY */}
      <AnimatePresence>
        {confirmState.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md px-6"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-sm bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-[1.5rem] bg-red-500/10 flex items-center justify-center">
                <Trash2 className="text-red-500" size={28} />
              </div>

              <h3 className="text-center text-xl font-black tracking-tight mb-2">
                Confirm Action
              </h3>

              <p className="text-center text-xs text-gray-500 mb-8 leading-relaxed">
                {confirmState.message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    confirmState.onConfirm(false);
                    setConfirmState({ show: false, message: "", onConfirm: null });
                  }}
                  className="flex-1 py-4 rounded-[1.5rem] bg-white/[0.05] text-gray-400 font-bold active:scale-95 transition-transform"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    confirmState.onConfirm(true);
                    setConfirmState({ show: false, message: "", onConfirm: null });
                  }}
                  className="flex-1 py-4 rounded-[1.5rem] bg-red-500 text-black font-black active:scale-95 transition-transform shadow-lg shadow-red-500/20"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
