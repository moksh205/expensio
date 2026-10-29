import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Trash2, LogOut, LogIn, CloudCheck, CloudOff,
  ChevronRight, Download, Palette, ShieldCheck, KeyRound
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import SEO from '../components/SEO';
import Toast from '../components/Toast';
import ThemeToggle from '../components/ThemeToggle';
import { parseDate } from '../expenseUtils';

export default function Profile({ expenses = [], resetData, user, onLogout }) {
  const [name, setName] = useState(() => localStorage.getItem("username") || "");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [confirmState, setConfirmState] = useState({
    show: false,
    message: "",
    onConfirm: null,
  });

  const navigate = useNavigate();

  // 🔹 Opens the custom modal and resolves true/false
  const askConfirm = (message) =>
    new Promise((resolve) => {
      setConfirmState({ show: true, message, onConfirm: resolve });
    });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    localStorage.setItem("username", trimmedName);
    setName(trimmedName);
    triggerToast("Profile updated", "success");
  };

  const handleLogoutAction = async () => {
    try {
      await onLogout();
      triggerToast("Logged out", "info");
    } catch {
      triggerToast("Logout failed", "warning");
    }
  };

  const handleExportCSV = () => {
    if (!expenses || expenses.length === 0) {
      triggerToast("No data to export", "info");
      return;
    }

    try {
      const headers = ["Date", "Time", "Amount", "Category", "Payment", "Note"];

      // 1. Sort chronologically
      const sortedExpenses = [...expenses].sort((a, b) => parseDate(b) - parseDate(a));

      // 2. Map rows safely
      const rows = sortedExpenses.map((exp) => {
        const d = parseDate(exp);

        const safeAmount = Number(exp.amount) || 0;
        const safeCategory = exp.category || "Other";
        const safePayment = exp.payment_method || "Online";
        const safeNote = `"${(exp.note || "").replace(/"/g, '""')}"`;

        // Graceful fallback for completely corrupt data
        if (isNaN(d.getTime())) {
          return ["Invalid Date", "--:--", safeAmount, safeCategory, safePayment, safeNote];
        }

        return [
          d.toLocaleDateString("en-IN"),
          d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          safeAmount,
          safeCategory,
          safePayment,
          safeNote
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);

      const dateString = new Date().toLocaleDateString("en-IN").replace(/\//g, '-');
      link.download = `expensio_${dateString}.csv`;

      link.click();

      // Prevent memory leaks (delay so the download can start first)
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);

      triggerToast("CSV downloaded", "success");
    } catch (err) {
      console.error(err);
      triggerToast("Export failed", "warning");
    }
  };

  const total = expenses.reduce((sum, e) => {
    const amt = Number(e.amount);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const now = new Date();
  const monthTotal = expenses.reduce((sum, e) => {
    const d = parseDate(e);
    const amt = Number(e.amount);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && !isNaN(amt) ? sum + amt : sum;
  }, 0);

  const userIdentifier = name || user?.email || "Guest User";
  const inr = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const rowClass = "w-full min-h-14 px-4 flex items-center justify-between gap-3 transition-colors hover:bg-surface-2 active:bg-surface-2";
  const iconWrap = "w-9 h-9 shrink-0 rounded-full flex items-center justify-center";

  return (
    <div className="min-h-screen px-4 pt-safe pb-nav max-w-md mx-auto">
      <SEO
        title="Profile - Expensio"
        description="Manage your profile, view stats, and export your expense data."
      />
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <header className="flex items-center justify-between mb-5 px-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Profile<span className="text-accent">.</span></h1>
        <ThemeToggle />
      </header>

      {/* Identity — original big rounded avatar with badge */}
      <section className="text-center mb-6">
        <div className="relative inline-block">
          <div className="absolute inset-0 rounded-[2.5rem] bg-accent-soft blur-2xl" aria-hidden="true" />
          <div className="relative w-24 h-24 rounded-[2.5rem] bg-linear-to-br from-primary to-primary-2 p-[2px] shadow-card">
            <div className="w-full h-full rounded-[calc(2.5rem-2px)] bg-surface flex items-center justify-center font-display text-4xl font-bold text-accent">
              {userIdentifier.charAt(0).toUpperCase()}
            </div>
          </div>
          <span className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-xl border-4 border-bg flex items-center justify-center ${user ? "bg-cash text-white" : "bg-surface-2 text-muted"}`} aria-hidden="true">
            {user ? <ShieldCheck size={13} /> : <CloudOff size={13} />}
          </span>
        </div>
        <p className="mt-4 font-display text-2xl font-bold truncate px-4">{userIdentifier}</p>
        <p className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${user ? "text-emerald-700 dark:text-emerald-400" : "text-muted"}`}>
          {user ? <CloudCheck size={14} /> : <CloudOff size={14} />}
          {user ? "Cloud sync on" : "Local storage mode"}
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Month", value: inr(monthTotal) },
          { label: "All time", value: inr(total) },
          { label: "Logs", value: expenses.length },
        ].map(({ label: l, value }) => (
          <div key={l} className="card rounded-[1.5rem] p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted truncate">{l}</p>
            <p className="mt-1 font-display text-lg font-bold tabular-nums truncate">{value}</p>
          </div>
        ))}
      </section>

      {/* Auth */}
      <section className="mb-6">
        {!user ? (
          <div className="card rounded-[2rem] p-5">
            <p className="font-semibold">Back up your expenses</p>
            <p className="text-sm text-muted mt-1 mb-4">Log in to keep your data safe and use it on any device.</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-linear-to-br from-primary to-primary-2 text-on-primary min-h-13 rounded-full font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-card"
            >
              <LogIn size={18} /> Connect cloud sync
            </button>
          </div>
        ) : (
          <div className="card rounded-[2rem] px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 shrink-0 rounded-2xl bg-emerald-500/10 text-cash dark:text-emerald-400 flex items-center justify-center"><CloudCheck size={20} /></span>
              <div className="min-w-0">
                <p className="text-xs text-muted">Signed in as</p>
                <p className="text-sm font-medium truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogoutAction}
              className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400 px-4 min-h-11 rounded-full bg-red-500/10 active:scale-95 transition-all"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        )}
      </section>

      {/* Settings */}
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-2 px-2">Account</h2>
      <div className="card rounded-[2rem] overflow-hidden divide-y divide-line mb-5">
        <div className="p-4">
          <label htmlFor="displayName" className="text-xs text-muted">Display name</label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="displayName"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="flex-1 min-w-0 bg-surface-2 px-4 min-h-11 rounded-full text-sm outline-none border border-transparent focus:border-accent transition-colors placeholder:text-muted/70"
            />
            <button
              onClick={handleSave}
              aria-label="Save name"
              className="shrink-0 w-11 h-11 bg-linear-to-br from-primary to-primary-2 text-on-primary rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              <Save size={18} />
            </button>
          </div>
        </div>
        {user && (
          <button onClick={() => navigate("/update-password")} className={rowClass}>
            <span className="flex items-center gap-3">
              <span className={`${iconWrap} bg-accent-soft text-accent`}><KeyRound size={18} /></span>
              <span className="text-sm font-medium">Change password</span>
            </span>
            <ChevronRight size={18} className="text-muted" />
          </button>
        )}
      </div>

      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-2 px-2">App</h2>
      <div className="card rounded-[2rem] overflow-hidden divide-y divide-line mb-5">
        <div className={rowClass}>
          <span className="flex items-center gap-3">
            <span className={`${iconWrap} bg-accent-soft text-accent`}><Palette size={18} /></span>
            <span className="text-sm font-medium">Light / dark mode</span>
          </span>
          <ThemeToggle />
        </div>

        <button onClick={handleExportCSV} className={rowClass}>
          <span className="flex items-center gap-3">
            <span className={`${iconWrap} bg-accent-soft text-accent`}><Download size={18} /></span>
            <span className="text-sm font-medium">Export as CSV</span>
          </span>
          <ChevronRight size={18} className="text-muted" />
        </button>
      </div>

      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-2 px-2">Danger zone</h2>
      <div className="card rounded-[2rem] overflow-hidden mb-6">
        <button
          onClick={async () => {
            const confirmed = await askConfirm("This will permanently delete all your expenses. This can't be undone.");
            if (confirmed) {
              const ok = await resetData();
              triggerToast(ok ? "All data cleared" : "Couldn't clear data. Try again.", "warning");
            }
          }}
          className={rowClass}
        >
          <span className="flex items-center gap-3">
            <span className={`${iconWrap} bg-red-500/10 text-red-500`}><Trash2 size={18} /></span>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">Clear all data</span>
          </span>
          <ChevronRight size={18} className="text-muted" />
        </button>
      </div>

      <p className="text-center text-xs text-muted">Expensio v4</p>

      {/* ✅ CUSTOM MODAL OVERLAY (bottom sheet) */}
      <AnimatePresence>
        {confirmState.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirmTitle"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="card w-full max-w-sm p-6 rounded-[2rem]"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 className="text-red-500" size={24} />
              </div>

              <h3 id="confirmTitle" className="text-center font-display text-xl font-bold mb-1">Clear all data?</h3>

              <p className="text-center text-sm text-muted mb-6">
                {confirmState.message}
              </p>

              <div className="flex gap-3">
                <button
                  autoFocus
                  onClick={() => {
                    confirmState.onConfirm(false);
                    setConfirmState({ show: false, message: "", onConfirm: null });
                  }}
                  className="flex-1 min-h-12 rounded-full bg-surface-2 font-semibold active:scale-95 transition-transform"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    confirmState.onConfirm(true);
                    setConfirmState({ show: false, message: "", onConfirm: null });
                  }}
                  className="flex-1 min-h-12 rounded-full bg-red-600 text-white font-semibold active:scale-95 transition-transform"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
