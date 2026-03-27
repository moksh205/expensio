import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, ArrowRight, Sparkles, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginSignup({ onLogin }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [toast, setToast] = useState("");

  const navigate = useNavigate();

  // Password validation
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const generateSuggestions = (name) => {
    return [
      name + "123",
      name + "_01",
      name + "_dev",
      name + Math.floor(Math.random() * 100),
    ];
  };

  const handleSubmit = () => {
    if (!name.trim() || !password.trim()) {
      showToast("Please fill all fields ⚠️");
      return;
    }

    if (!passwordRegex.test(password)) {
      showToast("Letters + Numbers required (min 6) 🔒");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || {};

    if (isSignup) {
      if (users[name]) {
        setSuggestions(generateSuggestions(name));
        showToast("Username already exists ❌");
        return;
      }

      users[name] = { password };
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("username", name);
      showToast("Account created successfully 🎉");

      setTimeout(() => {
        onLogin(name);
        navigate("/");
      }, 1000);
    } else {
      if (!users[name] || users[name].password !== password) {
        showToast("Invalid credentials 🚫");
        return;
      }
      localStorage.setItem("username", name);
      showToast("Login successful ✅");

      setTimeout(() => {
        onLogin(name);
        navigate("/");
      }, 1000);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white px-8 flex flex-col justify-center max-w-md mx-auto relative overflow-hidden font-sans">
      
      {/* 🔹 TOAST POPUP AT TOP */}
      <div className="fixed top-10 left-0 right-0 z-[100] flex justify-center pointer-events-none">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ y: -50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-[2rem] shadow-2xl flex items-center gap-3 pointer-events-auto"
            >
              <div className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center">
                 <AlertCircle size={14} />
              </div>
              <span className="text-sm font-bold tracking-tight">{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-20%] w-[100%] h-[40%] bg-indigo-600/15 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] right-[-20%] w-[80%] h-[30%] bg-emerald-600/10 blur-[100px] rounded-full -z-10" />

      {/* Branding */}
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mb-12 text-center">
        <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-[2.2rem] flex items-center justify-center mx-auto mb-6">
          <Sparkles className="text-indigo-500" size={28} />
        </div>
        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent leading-none">
          Expensio.
        </h1>
      </motion.div>

      <div className="space-y-5">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold tracking-tight">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>
        </div>

        {/* Username */}
        <div className="relative group">
          <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSuggestions([]);
            }}
            className="w-full bg-white/[0.03] border border-white/5 p-5 pl-14 rounded-[1.8rem] text-sm font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-700"
          />
        </div>

        {/* Suggestions Chips */}
        {suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-2">
            <p className="text-[10px] uppercase tracking-widest font-black text-gray-600 mb-2">Available:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setName(s);
                    setSuggestions([]);
                  }}
                  className="px-3 py-1.5 bg-white/[0.05] border border-white/5 rounded-xl text-[10px] font-bold text-indigo-400 hover:bg-white/10 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Password */}
        <div className="relative group">
          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 p-5 pl-14 rounded-[1.8rem] text-sm font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-700"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-white text-black p-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 active:scale-[0.97] transition-all shadow-xl shadow-white/5"
        >
          {isSignup ? "Sign Up" : "Login"}
          <ArrowRight size={16} />
        </button>

        {/* Toggle */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setSuggestions([]);
            }}
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
          >
            {isSignup ? "Already have an account? " : "New user? "}
            <span className="text-indigo-500 ml-1">{isSignup ? "Login" : "Sign Up"}</span>
          </button>
        </div>

        <div className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.2em] text-center pt-4">
          Data stored locally 🔒
        </div>
      </div>
    </div>
  );
}