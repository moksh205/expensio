import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

// 🔹 0–4 score: length, mixed case, number, symbol
const passwordStrength = (pw = "") => {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length < 6) score = Math.min(score, 1);
  const labels = ["Too short", "Weak", "Okay", "Good", "Strong"];
  return { score, label: labels[score] };
};

const BAR = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-500"];
const TEXT = ["text-red-500", "text-red-500", "text-amber-600 dark:text-amber-400", "text-emerald-700 dark:text-emerald-400", "text-emerald-700 dark:text-emerald-400"];

export default function PasswordField({ id, label = "Password", value, onChange, autoComplete = "current-password", showStrength = false, error, placeholder }) {
  const [show, setShow] = useState(false);
  const { score, label: strengthLabel } = passwordStrength(value);

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2 px-1">{label}</label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder || "••••••••"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : showStrength ? `${id}-strength` : undefined}
          className={`w-full min-h-13 pl-11 pr-12 rounded-2xl bg-surface-2 border outline-none transition-colors placeholder:text-muted/60 ${
            error ? "border-red-500/70 focus:border-red-500" : "border-transparent focus:border-accent"
          }`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl flex items-center justify-center text-muted hover:text-fg"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 px-1 text-xs text-red-500">{error}</p>}

      {showStrength && value && !error && (
        <div id={`${id}-strength`} className="mt-2 px-1 flex items-center gap-2" aria-live="polite">
          <div className="flex-1 grid grid-cols-4 gap-1" aria-hidden="true">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className={`h-1.5 rounded-full transition-colors ${score >= i ? BAR[score] : "bg-surface-2"}`} />
            ))}
          </div>
          <span className={`text-xs font-semibold ${TEXT[score]}`}>{strengthLabel}</span>
        </div>
      )}
    </div>
  );
}
