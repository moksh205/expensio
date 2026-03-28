import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Save, Trash2, Wallet, Database, 
  ShieldAlert, ChevronRight, LogOut, LogIn, CloudSync,
  CheckCircle2, AlertTriangle, Info
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function Profile({ expenses = [], resetData, user, onLogout }) {
  const [name, setName] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (savedName) setName(savedName);
  }, []);

  // ✅ FIXED TOAST (no stale state bug)
  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });

    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // ✅ TRIMMED SAVE
  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    localStorage.setItem("username", trimmed);
    setName(trimmed);
    triggerToast("Profile Updated", "success");
  };

  // ✅ SAFE LOGOUT (supports async)
  const handleLogoutAction = async () => {
    try {
      await onLogout?.();
      triggerToast("Logged Out Successfully", "info");
    } catch (e) {
      triggerToast("Logout Failed", "warning");
    }
  };

  // ✅ SAFE TOTAL CALCULATION
  const total = expenses.reduce((sum, e) => {
    const val = Number(e?.amount);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  // ✅ SAFE NAME DISPLAY
  const displayName =
    user?.email ||
    name ||
    "Guest User";

  const firstLetter =
    displayName?.charAt(0)?.toUpperCase() || "G";

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-10 pb-32 max-w-md mx-auto font-sans relative overflow-hidden">
      
      {/* 🔹 CUSTOM TOAST SYSTEM */}
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
              <div>
                <p className={`text-sm font-bold ${
                  toast.type === "success" ? "text-emerald-400" :
                  toast.type === "warning" ? "text-red-400" : "text-indigo-400"
                }`}>{toast.message}</p>
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-none mt-1">Expensio Cloud</p>
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
                {firstLetter}
              </span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-500 rounded-xl border-4 border-[#050505] flex items-center justify-center shadow-lg">
            <ShieldAlert size={12} className="text-white" />
          </div>
        </div>

        <h2 className="mt-4 text-xl font-bold tracking-tight">{name || "Guest User"}</h2>
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CloudSync size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400">Cloud Sync Active</p>
                <p className="text-[10px] text-gray-500 font-medium truncate max-w-[150px]">
                  {user?.email || "User"}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogoutAction} 
              className="p-3 text-gray-600 hover:text-red-500 transition-colors active:scale-90"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </section>

      {/* Preferences */}
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

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center">
          <Wallet size={20} className="text-indigo-400 mb-2" />
          <p className="text-[9px] text-gray-600">Net Burn</p>
          <p className="text-xl font-black">₹{total.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center">
          <Database size={20} className="text-emerald-400 mb-2" />
          <p className="text-[9px] text-gray-600">Entries</p>
          <p className="text-xl font-black">{expenses.length}</p>
        </div>
      </section>

      {/* Danger */}
      <section>
        <button
          onClick={() => {
            if (window.confirm("Erase all data?")) {
              resetData();
              triggerToast("All Data Cleared", "warning");
            }
          }}
          className="w-full bg-red-500/5 border border-red-500/10 p-5 rounded-[2rem]"
        >
          Clear All Data
        </button>
      </section>
    </div>
  );
}
