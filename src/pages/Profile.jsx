import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Save, Trash2, Wallet, Database, 
  ShieldAlert, ChevronRight, LogOut, LogIn, CloudSync 
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function Profile({ expenses = [], resetData, user, onLogout }) {
  const [name, setName] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  // Load local name
  useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (savedName) setName(savedName);
  }, []);

  const handleSave = () => {
    localStorage.setItem("username", name);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const displayName = user?.email || name || "Guest";

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-10 pb-32 max-w-md mx-auto font-sans relative overflow-hidden">
      
      {/* 🔹 Background Ambient Glows */}
      <div className="fixed top-[-5%] left-[-10%] w-[70%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full -z-10" />
      <div className="fixed bottom-[10%] right-[-10%] w-[50%] h-[30%] bg-emerald-600/5 blur-[100px] rounded-full -z-10" />

      <header className="mb-10 text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-8">Profile</h1>

        {/* 🔹 Premium Squircle Avatar */}
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-indigo-600 to-emerald-500 p-[2px] shadow-2xl shadow-indigo-500/20">
            <div className="w-full h-full rounded-[calc(2.5rem-2px)] bg-[#0a0a0a] flex items-center justify-center">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-indigo-400 to-emerald-400">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-500 rounded-full border-4 border-[#050505] flex items-center justify-center">
            <ShieldAlert size={12} className="text-white" />
          </div>
        </div>

        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
          {user ? "Personal Account" : "Guest Mode"}
        </p>
      </header>

      {/* 🔹 Auth / Sync Section */}
      <section className="mb-8">
        {!user ? (
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-white text-black p-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-white/5"
          >
            <LogIn size={18} /> Login to Sync Data
          </button>
        ) : (
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-[1.8rem] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CloudSync size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400">Cloud Synced</p>
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-tight">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={onLogout} 
              className="p-3 text-gray-500 hover:text-red-500 transition-colors active:scale-90"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </section>

      {/* 🔹 Name Edit Section */}
      <section className="mb-10 space-y-4">
        <div className="relative group">
          <input
            type="text"
            placeholder="Edit display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 p-5 pr-14 rounded-[2rem] text-sm font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-700"
          />
          <button
            onClick={handleSave}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all active:scale-90 ${
              isSaved ? "bg-emerald-500 text-black" : "bg-indigo-500 text-white"
            }`}
          >
            <Save size={18} />
          </button>
        </div>
      </section>

      {/* 🔹 Bento Stats Grid */}
      <section className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center">
          <Wallet size={20} className="text-indigo-400 mb-3" />
          <p className="text-[9px] uppercase font-black tracking-widest text-gray-600 mb-1">Total Spent</p>
          <p className="text-xl font-black tracking-tight text-white">₹{total.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center">
          <Database size={20} className="text-emerald-400 mb-3" />
          <p className="text-[9px] uppercase font-black tracking-widest text-gray-600 mb-1">Total Logs</p>
          <p className="text-xl font-black tracking-tight text-white">{expenses.length}</p>
        </div>
      </section>

      {/* 🔹 Danger Zone */}
      <section>
        <p className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-4">Danger Zone</p>
        <button
          onClick={() => {
            if (window.confirm("This will erase everything. Continue?")) resetData();
          }}
          className="w-full group bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 p-5 rounded-[2rem] flex items-center justify-between transition-all active:scale-95"
        >
          <div className="flex items-center gap-4 text-red-500">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trash2 size={18} />
            </div>
            <span className="text-sm font-bold tracking-tight">Clear All Data</span>
          </div>
          <ChevronRight size={18} className="text-red-900/50" />
        </button>
      </section>

      {/* Footer Info */}
      <footer className="mt-16 text-center opacity-20">
        <p className="text-[10px] font-black uppercase tracking-widest">Expensio Cloud • v1.0.4</p>
      </footer>
    </div>
  );
}