import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, LinkIcon, ShieldCheck, LockKeyhole, Check } from "lucide-react";
import SEO from "../components/SEO";
import AuthShell from "../components/AuthShell";
import PasswordField from "../components/PasswordField";
import { supabase } from "../supabase";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [validSession, setValidSession] = useState(null); // 🔥 important
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  // 🔥 Check if reset session exists (reset link, or already logged in)
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setValidSession(Boolean(data.session));
    };

    checkSession();
  }, []);

  // After success, go home automatically
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => navigate("/"), 2500);
    return () => clearTimeout(t);
  }, [done, navigate]);

  const rules = [
    { ok: password.length >= 6, text: "At least 6 characters" },
    { ok: /\d/.test(password), text: "Has a number" },
    { ok: password.length > 0 && password === confirm, text: "Both passwords match" },
  ];

  const handleUpdate = async () => {
    const next = {};
    if (password.length < 6) next.password = "Password must be at least 6 characters";
    if (confirm !== password) next.confirm = "Passwords don't match";
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);

    if (error) {
      setFormError(/same|different/i.test(error.message)
        ? "New password must be different from your old one."
        : "Link expired. Please request a new one.");
    } else {
      setDone(true);
    }
  };

  // 🔄 Loading state
  if (validSession === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  // ❌ Expired / invalid link
  if (!validSession) {
    return (
      <AuthShell
        backTo="/login"
        backLabel="Back to login"
        icon={<LinkIcon size={30} className="text-red-500" />}
        title="Link Expired"
        subtitle="This reset link is invalid or already used. Request a fresh one — it only takes a second."
      >
        <div className="space-y-3">
          <button
            onClick={() => navigate("/reset-password")}
            className="w-full bg-linear-to-br from-primary to-primary-2 text-on-primary min-h-14 rounded-full font-semibold active:scale-[0.98] transition-transform shadow-card"
          >
            Send a new link
          </button>
          <button onClick={() => navigate("/login")} className="w-full min-h-12 rounded-full bg-surface-2 font-semibold text-sm">
            Back to login
          </button>
        </div>
      </AuthShell>
    );
  }

  // ✅ Done
  if (done) {
    return (
      <AuthShell
        backTo={null}
        icon={<motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}><ShieldCheck size={32} /></motion.span>}
        title="Password updated"
        subtitle="You're all set. Taking you to your dashboard…"
      >
        <button
          onClick={() => navigate("/")}
          className="w-full bg-linear-to-br from-primary to-primary-2 text-on-primary min-h-14 rounded-full font-semibold active:scale-[0.98] transition-transform shadow-card"
        >
          Go to dashboard
        </button>
      </AuthShell>
    );
  }

  // ✏️ Form
  return (
    <>
      <SEO title="Update password - Expensio" description="Set a new password for your Expensio account." />
      <AuthShell
        backTo="/"
        backLabel="Back to home"
        icon={<LockKeyhole size={30} />}
        title="Set a new password"
        subtitle="Pick something you'll remember but others can't guess."
      >
        <form
          className="card rounded-[2rem] p-5 space-y-4"
          onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}
          noValidate
        >
          <PasswordField
            id="newPassword"
            label="New password"
            value={password}
            onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: "" })); }}
            autoComplete="new-password"
            showStrength
            error={errors.password}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            value={confirm}
            onChange={(v) => { setConfirm(v); setErrors((e) => ({ ...e, confirm: "" })); }}
            autoComplete="new-password"
            error={errors.confirm}
          />

          {/* Checklist */}
          <ul className="space-y-1.5 px-1" aria-label="Password requirements">
            {rules.map(({ ok, text }) => (
              <li key={text} className={`flex items-center gap-2 text-xs ${ok ? "text-emerald-700 dark:text-emerald-400" : "text-muted"}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${ok ? "bg-emerald-500/15" : "bg-surface-2"}`}>
                  {ok && <Check size={10} strokeWidth={3} />}
                </span>
                {text}
              </li>
            ))}
          </ul>

          {formError && <p role="alert" className="text-sm text-red-500 text-center">{formError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-br from-primary to-primary-2 text-on-primary min-h-14 rounded-full font-semibold flex justify-center items-center active:scale-[0.98] transition-transform shadow-card disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Update password"}
          </button>
        </form>
      </AuthShell>
    </>
  );
}
