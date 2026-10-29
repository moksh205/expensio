import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Mail, Loader2, UserRound, UserPlus } from "lucide-react";
import SEO from '../components/SEO';
import Toast from '../components/Toast';
import AuthShell from '../components/AuthShell';
import PasswordField from '../components/PasswordField';
import { supabase } from "../supabase";

export default function LoginSignup({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true);
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

        // 🔥 Email confirmation is on → no session yet, so don't pretend we're logged in
        if (!data.session) {
          showToast("Check your email to confirm your account");
          setIsSignup(false);
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
    <>
      <SEO
        title="Login / Signup - Expensio"
        description="Sign in to securely sync your expenses across all your devices."
      />
      <Toast show={Boolean(toast)} message={toast} type="info" />

      <AuthShell
        backTo="/profile"
        icon={isSignup ? <UserPlus size={30} /> : <UserRound size={30} />}
        title={isSignup ? "Create account" : "Welcome back"}
        subtitle={isSignup ? "Sync your expenses safely across every device." : "Log in to see your expenses on any device."}
      >
        {/* Sign up / Log in switch */}
        <div className="relative flex p-1 bg-surface-2 rounded-full mb-4" role="tablist" aria-label="Account">
          {[{ v: true, t: "Sign up" }, { v: false, t: "Log in" }].map(({ v, t }) => (
            <button
              key={t}
              role="tab"
              aria-selected={isSignup === v}
              onClick={() => setIsSignup(v)}
              className={`relative flex-1 min-h-11 rounded-full text-sm font-semibold transition-colors ${isSignup === v ? "text-fg bg-surface shadow-card" : "text-muted"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <form
          className="card rounded-[2rem] p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          noValidate
        >
          {/* Email */}
          <div>
            <label htmlFor="loginEmail" className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2 px-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                id="loginEmail"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-h-13 pl-11 pr-4 rounded-2xl bg-surface-2 border border-transparent outline-none focus:border-accent transition-colors placeholder:text-muted/60"
              />
            </div>
          </div>

          {/* Password */}
          <PasswordField
            id="loginPassword"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete={isSignup ? "new-password" : "current-password"}
            showStrength={isSignup}
          />

          {/* 🔥 Forgot Password → its own page (email carried over) */}
          {!isSignup && (
            <div className="text-right -mt-2">
              <Link
                to="/reset-password"
                state={{ email }}
                className="inline-flex items-center min-h-11 text-sm font-medium text-accent"
              >
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-br from-primary to-primary-2 text-on-primary min-h-14 rounded-full font-semibold flex justify-center items-center gap-2 active:scale-[0.98] transition-transform shadow-card disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {isSignup ? "Create account" : "Log in"}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-4 px-4">
          Your expenses saved as a guest will move to your account automatically.
        </p>
      </AuthShell>
    </>
  );
}
