import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Sparkles, Lock, AlertCircle, 
  Mail, Loader2, Eye, EyeOff 
} from "lucide-react";
import SEO from '../components/SEO';
import { supabase } from "../supabase";

export default function LoginSignup({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      showToast("Enter email and password");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // 🔥 Detect existing user
        if (data.user && data.user.identities?.length === 0) {
          showToast("Account already exists. Please login.");
          return;
        }

        showToast("Account created successfully");

        setTimeout(() => {
          onLogin(data.user);
          navigate("/");
        }, 800);

      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          showToast("Invalid email or password");
          return;
        }

        showToast("Login successful");

        setTimeout(() => {
          onLogin(data.user);
          navigate("/");
        }, 800);
      }

    } catch (err) {
      console.error(err);
      showToast("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white px-8 flex flex-col justify-center max-w-md mx-auto">
 <SEO 
        title="Login / Signup - Expensio" 
        description="Sign in to securely sync your expenses across all your devices." 
      /> 
      
      {/* Toast */}
      <div className="fixed top-10 left-0 right-0 flex justify-center z-50">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              className="bg-white/10 border border-white/20 px-5 py-2 rounded-xl flex items-center gap-2"
            >
              <AlertCircle size={14} />
              <span className="text-sm">{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Branding */}
      <div className="text-center mb-10">
        <Sparkles className="mx-auto text-indigo-500 mb-3" size={28} />
        <h1 className="text-3xl font-bold">Expensio</h1>
      </div>

      <div className="space-y-4">

        <h2 className="text-center text-lg font-semibold">
          {isSignup ? "Create Account" : "Login"}
        </h2>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 pl-12 rounded-xl bg-white/10 outline-none"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 pl-12 pr-12 rounded-xl bg-white/10 outline-none"
          />

          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-white text-black p-4 rounded-xl font-bold flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : (
            <>
              {isSignup ? "Sign Up" : "Login"}
              <ArrowRight size={14} />
            </>
          )}
        </button>

        {/* Toggle */}
        <div className="text-center">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-sm text-gray-400"
          >
            {isSignup ? "Already have an account? Login" : "Create new account"}
          </button>
        </div>

      </div>
    </div>
  );
}