import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Wallet, CreditCard, Check, PenLine } from "lucide-react";
import SEO from '../components/SEO';
import Toast from '../components/Toast';
import { supabase } from "../supabase";
import { getCategoryStyle, sortCategoriesByUsage } from "../expenseUtils";

const MAX_LEN = 8;
const label = "text-xs font-semibold uppercase tracking-[0.18em] text-muted";

export default function AddExpense({ addExpense, expenses = [] }) {
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Online");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedToCloud, setSavedToCloud] = useState(false);
  const [error, setError] = useState("");

  const [toastTimer, setToastTimer] = useState(null);

  const paymentOptions = [
    { name: "Online", Icon: CreditCard, tone: "text-accent" },
    { name: "Cash", Icon: Wallet, tone: "text-cash dark:text-emerald-400" },
  ];

  // 🔥 Most-used recent categories first. Order is fixed while you're on the
  // page (no jumping after save); it only fills in once expenses finish loading.
  const [order, setOrder] = useState(() => sortCategoriesByUsage(expenses));
  const [orderReady, setOrderReady] = useState(expenses.length > 0);
  if (!orderReady && expenses.length > 0) {
    setOrderReady(true);
    setOrder(sortCategoriesByUsage(expenses));
  }

  const categories = order.map(({ name }) => ({ name, ...getCategoryStyle(name, 18) }));

  const numAmount = parseFloat(amount);

  const isValidAmount =
    !isNaN(numAmount) &&
    numAmount > 0 &&
    amount !== ".";

  const isValidNote =
    selectedCategory !== "Other" ||
    customNote.trim().length > 0;

  const canSubmit =
    isValidAmount &&
    selectedCategory &&
    isValidNote &&
    !loading;

  const handleAdd = async () => {
    if (!canSubmit || loading) return;

    setLoading(true);
    setError("");

    const finalNote =
      selectedCategory === "Other"
        ? customNote.trim()
        : customNote.trim() || selectedCategory;

    const expenseData = {
      id: Date.now(),
      amount: numAmount,
      category: selectedCategory,
      note: finalNote,
      created_at: new Date().toISOString(),
      payment_method: paymentMethod,
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        let guestData = [];
        try {
          guestData = JSON.parse(localStorage.getItem("guest_expenses")) || [];
        } catch {
          guestData = [];
        }

        guestData.push(expenseData);
        localStorage.setItem("guest_expenses", JSON.stringify(guestData));
        addExpense(expenseData);
      } else {
        const { data: insertedData, error } = await supabase
          .from("expenses")
          .insert([
            {
              user_id: user.id,
              amount: expenseData.amount,
              category: expenseData.category,
              note: expenseData.note,
              created_at: expenseData.created_at,
              payment_method: expenseData.payment_method,
            },
          ])
          .select();

        if (error) throw error;
        addExpense(insertedData[0]);
      }

      setSavedToCloud(Boolean(user));
      setShowToast(true);
      setAmount("");
      setSelectedCategory("");
      setCustomNote("");
      setPaymentMethod("Online");

      if (toastTimer) clearTimeout(toastTimer);
      const timer = setTimeout(() => setShowToast(false), 3000);
      setToastTimer(timer);

    } catch (err) {
      console.error("Error saving:", err.message);
      setError("Couldn't save. Check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pt-safe max-w-md mx-auto" style={{ paddingBottom: "calc(12rem + env(safe-area-inset-bottom))" }}>
      <SEO
        title="Add Expense - Expensio"
        description="Quickly add a new expense and keep your budget on track."
      />
      <Toast
        show={showToast}
        message="Expense saved"
        sub={savedToCloud ? "Synced to cloud" : "Saved on this device"}
      />

      <h1 className="font-display text-3xl font-bold tracking-tight px-1">
        Quick Add<span className="text-accent">.</span>
      </h1>

      {/* Amount — big, centered, underline (original layout) */}
      <section className="mt-8 mb-8 flex flex-col items-center">
        <label htmlFor="amount" className={label}>Transaction amount</label>
        <div className="mt-4 w-full max-w-[280px] flex items-baseline justify-center gap-1 border-b-2 border-line focus-within:border-accent transition-colors pb-2">
          <span className={`text-3xl font-light transition-colors ${amount ? "text-accent" : "text-muted"}`}>₹</span>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="0"
            autoComplete="off"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*\.?\d{0,2}$/.test(val) && val.length <= MAX_LEN) {
                setAmount(val);
              }
            }}
            style={{ width: `${Math.max(amount.length, 1) + 1}ch` }}
            className={`bg-transparent font-display font-extrabold tracking-tight outline-none placeholder:text-muted/30 tabular-nums text-center ${
              amount.length > 5 ? "text-5xl" : "text-6xl"
            }`}
          />
        </div>
      </section>

      {/* Payment method */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {paymentOptions.map(({ name, Icon, tone }) => {
          const isActive = paymentMethod === name;
          return (
            <button
              key={name}
              onClick={() => setPaymentMethod(name)}
              aria-pressed={isActive}
              className={`card rounded-2xl min-h-14 flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98] ${
                isActive ? "border-accent! bg-accent-soft!" : "text-muted"
              }`}
            >
              <Icon size={18} className={isActive ? tone : ""} />
              <span className={isActive ? "text-fg" : ""}>{name}</span>
            </button>
          );
        })}
      </div>

      {/* Category — 2-column grid with names, most used first */}
      <div className="flex items-baseline justify-between px-1 mb-3">
        <h2 className={label}>Category</h2>
        {orderReady && <p className="text-xs text-muted">Most used first</p>}
      </div>
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              aria-pressed={isActive}
              className={`card rounded-2xl min-h-14 px-3 flex items-center gap-3 text-left transition-all active:scale-[0.98] ${
                isActive ? "border-accent! bg-accent-soft!" : ""
              }`}
            >
              <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${cat.color}`}>
                {cat.icon}
              </span>
              <span className={`flex-1 text-sm truncate ${isActive ? "font-semibold text-fg" : "font-medium text-muted"}`}>
                {cat.name}
              </span>
              {isActive && (
                <span className="w-5 h-5 shrink-0 rounded-full bg-linear-to-br from-primary to-primary-2 text-on-primary flex items-center justify-center">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Note */}
      <label htmlFor="note" className={`block ${label} px-1 mb-2`}>
        Note {selectedCategory === "Other"
          ? <span className="normal-case tracking-normal text-red-500">· required</span>
          : <span className="normal-case tracking-normal font-normal">· optional</span>}
      </label>
      <div className="relative">
        <PenLine size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id="note"
          type="text"
          placeholder={selectedCategory === "Other" ? "What was it for? (e.g. Gift)" : "e.g. Lunch with friends"}
          value={customNote}
          maxLength={60}
          onChange={(e) => setCustomNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="w-full pl-11 pr-4 min-h-13 rounded-2xl bg-surface border border-line outline-none focus:border-accent transition-colors placeholder:text-muted/70 text-sm"
        />
      </div>

      {/* Save — fixed just above the bottom nav */}
      <div className="fixed inset-x-0 z-40 flex justify-center px-4 pointer-events-none" style={{ bottom: "calc(env(safe-area-inset-bottom) + 5.75rem)" }}>
        <div className="w-full max-w-[380px] pointer-events-auto">
          <AnimatePresence>
            {error && (
              <motion.p role="alert" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-2 text-center text-sm text-red-500 card rounded-xl py-2">
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          <motion.button
            whileTap={canSubmit ? { scale: 0.98 } : {}}
            onClick={handleAdd}
            disabled={!canSubmit}
            className={`w-full min-h-14 rounded-full font-semibold text-base flex items-center justify-center gap-2 transition-colors ${
              canSubmit
                ? "bg-linear-to-br from-primary to-primary-2 text-on-primary shadow-card"
                : "bg-surface-2 text-muted border border-line"
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={22} /> : canSubmit ? `Save ₹${numAmount.toLocaleString("en-IN")}` : "Save Transaction"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
