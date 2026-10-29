import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, MailCheck, Loader2, ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import AuthShell from "../components/AuthShell";
import { supabase } from "../supabase";

const RESEND_SECONDS = 60;
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function ResetPassword() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Resend timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendLink = async () => {
    if (!isEmail(email)) {
      setError("Enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");

    // Uses window.location.origin so it works on localhost AND the live domain
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/update-password`,
    });

    setLoading(false);
    if (err) {
      setError(/rate|seconds/i.test(err.message) ? "Too many tries. Please wait a minute and try again." : "Couldn't send the link. Check the email and try again.");
      return;
    }
    setSent(true);
    setCooldown(RESEND_SECONDS);
  };

  return (
    <>
      <SEO title="Reset password - Expensio" description="Get a link to reset your Expensio password." />
      <AnimatePresence mode="wait" initial={false}>
        {!sent ? (
          <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <AuthShell
              backTo="/login"
              backLabel="Back to login"
              icon={<KeyRound size={30} />}
              title="Forgot password?"
              subtitle="No worries. Enter your email and we'll send you a link to set a new one."
              footer={<>Remembered it? <Link to="/login" className="inline-flex items-center min-h-11 px-1 font-semibold text-accent">Log in</Link></>}
            >
              <form
                className="card rounded-[2rem] p-5 space-y-4"
                onSubmit={(e) => { e.preventDefault(); sendLink(); }}
                noValidate
              >
                <div>
                  <label htmlFor="resetEmail" className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2 px-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                      id="resetEmail"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? "resetEmail-error" : undefined}
                      className={`w-full min-h-13 pl-11 pr-4 rounded-2xl bg-surface-2 border outline-none transition-colors placeholder:text-muted/60 ${
                        error ? "border-red-500/70 focus:border-red-500" : "border-transparent focus:border-accent"
                      }`}
                    />
                  </div>
                  {error && <p id="resetEmail-error" role="alert" className="mt-1.5 px-1 text-xs text-red-500">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-br from-primary to-primary-2 text-on-primary min-h-14 rounded-full font-semibold flex justify-center items-center gap-2 active:scale-[0.98] transition-transform shadow-card disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <>Send reset link <ArrowRight size={16} /></>}
                </button>
              </form>
            </AuthShell>
          </motion.div>
        ) : (
          <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <AuthShell
              backTo="/login"
              backLabel="Back to login"
              icon={<MailCheck size={30} />}
              title="Check your inbox"
              subtitle={<>We sent a reset link to <span className="font-semibold text-fg break-all">{email.trim()}</span>. It expires in 1 hour.</>}
            >
              <div className="card rounded-[2rem] p-5 space-y-3">
                <ol className="space-y-2.5 text-sm">
                  {["Open the email from Expensio", "Tap “Reset password”", "Choose a new password"].map((step, i) => (
                    <li key={step} className="flex items-center gap-3">
                      <span className="w-7 h-7 shrink-0 rounded-full bg-accent-soft text-accent text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <p className="text-xs text-muted pt-1">Can't find it? Check your spam folder.</p>

                <button
                  onClick={sendLink}
                  disabled={cooldown > 0 || loading}
                  className="w-full min-h-12 rounded-full bg-surface-2 font-semibold text-sm flex items-center justify-center gap-2 disabled:text-muted transition-colors"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
                </button>
                {error && <p role="alert" className="text-xs text-red-500 text-center">{error}</p>}
                <button
                  onClick={() => { setSent(false); setError(""); }}
                  className="w-full min-h-11 text-sm font-medium text-accent"
                >
                  Use a different email
                </button>
              </div>
            </AuthShell>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
