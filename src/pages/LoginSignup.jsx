import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Sparkles, Lock, AlertCircle, 
  Mail, Loader2, Eye, EyeOff 
} from "lucide-react";

// 🔥 Supabase
import { supabase } from "../supabase";

export default function LoginSignup({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true);
  const [showPassword, setShowPassword] = useState(false); // 👁️ Password toggle state
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      showToast("Please fill all fields ⚠️");
      return;
    }

    if (!passwordRegex.test(password)) {
      showToast("Letters + Numbers required (min 6) 🔒");
      return;
    }

    setLoading(true);

    try {
      let response;

      if (isSignup) {
        response = await supabase.auth.signUp({
          email,
          password,
        });
        if (response.error) throw response.error;
        showToast("Account created 🎉");
      } else {
        response = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (response.error) throw response.error;
        showToast("Welcome back! ✅");
      }

      setTimeout(() => {
        onLogin(response.data.user);
        navigate("/");
      }, 800);

    } catch (err) {
      showToast(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white px-8 flex flex-col justify-center max-w-md mx-auto relative overflow-hidden font-sans">
      
      {/* 🔹 TOAST */}
      <div className="fixed top-10 left-0 right-0 z-[100] flex justify-center pointer-events-none">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ y: -50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-[2rem] flex items-center gap-3 shadow-2xl pointer-events-auto"
            >
              <AlertCircle size={14} className="text-indigo-400" />
              <span className="text-sm font-bold tracking-tight">{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-20%] w-[100%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] right-[-20%] w-[80%] h-[30%] bg-emerald-600/5 blur-[100px] rounded-full -z-10" />

      {/* Branding */}
      <motion.div className="mb-12 text-center">
        <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-[2.2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/10">
          <Sparkles className="text-indigo-500" size={28} />
        </div>
        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent leading-none">
          Expensio.
        </h1>
      </motion.div>

      <div className="space-y-5">
        <h2 className="text-center text-xl font-bold tracking-tight">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        {/* Email Input */}
        <div className="relative group">
          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 p-5 pl-14 rounded-[1.8rem] text-sm font-bold outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700"
          />
        </div>

        {/* Password Input with Eye Toggle */}
        <div className="relative group">
          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 p-5 pl-14 pr-14 rounded-[1.8rem] text-sm font-bold outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700"
          />
          {/* 👁️ Eye Button */}
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-white text-black p-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 active:scale-[0.97] transition-all shadow-xl shadow-white/5 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : (
            <>
              {isSignup ? "Sign Up" : "Login"}
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Toggle Signup/Login */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setShowPassword(false); // Reset eye on toggle
            }}
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
          >
            {isSignup ? "Already have an account? " : "New to Expensio? "}
            <span className="text-indigo-500 ml-1">
              {isSignup ? "Login" : "Sign Up"}
            </span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-10 left-0 right-0 text-center opacity-10 pointer-events-none">
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">Expensio v1.0.4 • Local Sync</p>
      </div>
    </div>
  );
}