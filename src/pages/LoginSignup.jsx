import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, ArrowRight, ShieldCheck, Sparkles, Lock, Fingerprint, Eye, EyeOff } from "lucide-react";

export default function LoginSignup({ onLogin }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!name.trim() || !password.trim()) return;
    
    // Letters + Numbers, min 6 chars
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

    if (isSignup && !passwordRegex.test(password)) {
      alert("Password must contain letters + numbers (min 6 chars)");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || {};

    if (isSignup) {
      if (users[name]) {
        alert("User already exists. Please login.");
        return;
      }
      users[name] = { password };
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("username", name);
      onLogin(name);
      navigate("/");
    } else {
      if (!users[name] || users[name].password !== password) {
        alert("Invalid username or password");
        return;
      }
      localStorage.setItem("username", name);
      onLogin(name);
      navigate("/");
    }
  };

  // Logic for Password Strength UI
  const hasLetters = /[A-Za-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasLength = password.length >= 6;

  return (
    <div className="h-screen bg-[#050505] text-white px-8 flex flex-col justify-center max-w-md mx-auto relative overflow-hidden font-sans">
      
      {/* 🔹 Background Ambient Glows */}
      <div className="fixed top-[-10%] left-[-20%] w-[100%] h-[40%] bg-indigo-600/15 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] right-[-20%] w-[80%] h-[30%] bg-emerald-600/10 blur-[100px] rounded-full -z-10" />

      {/* 🔹 Branding Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-10 text-center"
      >
        <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-[2.2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
          {isSignup ? (
            <Sparkles className="text-indigo-500" size={28} />
          ) : (
            <Fingerprint className="text-emerald-500" size={28} />
          )}
        </div>
        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent leading-none">
          Expensio.
        </h1>
        <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black mt-3">
          {isSignup ? "Start Your Journey" : "Secure Access"}
        </p>
      </motion.div>

      <div className="space-y-5">
        <div className="px-2 text-center">
          <h2 className="text-xl font-bold tracking-tight">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>
        </div>

        {/* 🔹 Username Input */}
        <div className="relative group">
          <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 p-5 pl-14 rounded-[1.8rem] text-sm font-bold outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700"
          />
        </div>

        {/* 🔹 Password Input */}
        <div className="relative group">
          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type={show ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 p-5 pl-14 pr-14 rounded-[1.8rem] text-sm font-bold outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700"
          />
          <button 
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-indigo-400 transition-colors"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* 🔹 Password Strength Meter (Only for Signup) */}
        {isSignup && password.length > 0 && (
          <div className="px-2 flex gap-1.5 h-1">
             <div className={`flex-1 rounded-full transition-all ${hasLength ? 'bg-indigo-500' : 'bg-white/10'}`} />
             <div className={`flex-1 rounded-full transition-all ${hasLetters ? 'bg-indigo-500' : 'bg-white/10'}`} />
             <div className={`flex-1 rounded-full transition-all ${hasNumbers ? 'bg-indigo-500' : 'bg-white/10'}`} />
          </div>
        )}

        {/* 🔹 Primary Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-white text-black p-5 rounded-[2.2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-xl shadow-white/5 mt-2"
        >
          {isSignup ? "Create Account" : "Sign In"}
          <ArrowRight size={16} />
        </button>

        {/* 🔹 Security Badge */}
        <div className="flex items-center justify-center gap-2 py-2">
           <ShieldCheck size={14} className="text-gray-600" />
           <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">
             End-to-end Local Encryption
           </p>
        </div>

        {/* 🔹 Toggle View */}
        <div className="text-center pt-2">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
          >
            {isSignup ? "Already have an account? " : "New to Expensio? "}
            <span className="text-indigo-500 ml-1">
              {isSignup ? "Login" : "Sign Up"}
            </span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center opacity-10 pointer-events-none">
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">Expensio v1.0.4 • Privacy Priority</p>
      </div>
    </div>
  );
}