import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, Bike, ShoppingCart, Receipt, 
  Plus, Coffee, Package, MoreHorizontal, CheckCircle2, Loader2,
  ShoppingBag, Fuel, Pill, Ticket, Wallet, CreditCard 
} from "lucide-react";
import SEO from '../components/SEO';
import { supabase } from "../supabase";

export default function AddExpense({ addExpense }) {
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Online"); 
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [toastTimer, setToastTimer] = useState(null);

  // 🔥 Added Payment Options with matching Category styles
  const paymentOptions = [
    { name: "Cash", icon: <Wallet size={18} />, color: "bg-emerald-500/20 text-emerald-400" },
    { name: "Online", icon: <CreditCard size={18} />, color: "bg-indigo-500/20 text-indigo-400" }
  ];

  const categories = [
    { name: "Food", icon: <Utensils size={18} />, color: "bg-orange-500/20 text-orange-400" },
    { name: "Ride", icon: <Bike size={18} />, color: "bg-blue-500/20 text-blue-400" },
    { name: "Blinkit", icon: <Package size={18} />, color: "bg-yellow-500/20 text-yellow-400" },
    { name: "Zomato", icon: <Plus size={18} />, color: "bg-red-500/20 text-red-400" },
    { name: "Shopping", icon: <ShoppingCart size={18} />, color: "bg-purple-500/20 text-purple-400" },
    { name: "Bills", icon: <Receipt size={18} />, color: "bg-emerald-500/20 text-emerald-400" },
    { name: "Juice", icon: <Coffee size={18} />, color: "bg-pink-500/20 text-pink-400" },
    { name: "Grocery", icon: <ShoppingBag size={18} />, color: "bg-teal-500/20 text-teal-400" },
    { name: "Fuel", icon: <Fuel size={18} />, color: "bg-amber-500/20 text-amber-400" },
    { name: "Health", icon: <Pill size={18} />, color: "bg-rose-500/20 text-rose-400" },
    { name: "Entertainment", icon: <Ticket size={18} />, color: "bg-cyan-500/20 text-cyan-400" },
    { name: "Other", icon: <MoreHorizontal size={18} />, color: "bg-gray-500/20 text-gray-400" },
  ];

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative p-6 pb-32 max-w-md mx-auto text-white min-h-screen bg-[#050505] overflow-y-auto font-sans">
      <SEO 
        title="Add Expense - Expensio" 
        description="Quickly add a new expense and keep your budget on track." 
      />
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -100, x: "-50%" }}
            className="fixed top-6 left-1/2 z-[100] w-[90%] max-w-xs pointer-events-none"
          >
            <div className="bg-emerald-500/10 border border-emerald-500/50 backdrop-blur-xl p-4 rounded-3xl flex items-center gap-3 shadow-[0_20px_40px_rgba(16,185,129,0.2)]">
              <div className="bg-emerald-500 rounded-full p-1">
                <CheckCircle2 size={20} className="text-black" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-400">Saved Successfully</p>
                <p className="text-[10px] text-emerald-500/60 uppercase tracking-widest font-bold">Cloud Synced</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-2xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
        Quick Add
      </h1>

      <div className="flex flex-col items-center justify-center mb-6 mt-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-4">
          Transaction Amount
        </p>

        <div className="relative flex justify-center items-center w-full max-w-[260px] border-b border-white/10 pb-2 focus-within:border-indigo-500 transition-colors group">
          <span className={`absolute left-3 text-4xl font-light transition-colors duration-300 ${amount ? 'text-indigo-400' : 'text-gray-400'}`}>
            ₹
          </span>

          <input
            type="text" 
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*\.?\d*$/.test(val) && val.length <= 8) {
                setAmount(val);
              }
            }}
            className={`w-full bg-transparent text-center font-black outline-none placeholder:text-white/5 transition-all duration-300 px-12 ${
              amount.length > 5 ? "text-4xl" : "text-6xl"
            }`}
          />
        </div>
      </div>

      {/* 🔥 THE FIX: Payment UI exactly matches Category styling */}
      <div className="flex gap-3 mb-6">
        {paymentOptions.map((option) => {
          const isActive = paymentMethod === option.name;

          return (
            <button
              key={option.name}
              onClick={() => setPaymentMethod(option.name)}
              className={`relative flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${
                isActive
                  ? `${option.color} border-white/20 shadow-[0_0_25px_-5px_currentColor] scale-[0.98]`
                  : "bg-white/[0.02] border-transparent text-gray-500 hover:bg-white/[0.05]"
              }`}
            >
              {isActive && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
              <div className={`relative z-10 p-2 rounded-lg transition-transform duration-300 ${option.color} ${isActive ? "scale-110 brightness-125" : ""}`}>
                {option.icon}
              </div>
              <span className={`relative z-10 text-sm font-bold tracking-wide ${isActive ? "text-white" : "text-gray-500"}`}>
                {option.name}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selectedCategory === "Other" && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <input
              type="text"
              placeholder="What for? (e.g. Medicine, Gift)"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/[0.05] border border-indigo-500/30 outline-none focus:border-indigo-500 transition-all text-indigo-100 placeholder:text-gray-400 shadow-inner"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3 mb-10">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`relative flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${
                isActive
                  ? `${cat.color} border-white/20 shadow-[0_0_25px_-5px_currentColor] scale-[0.98]`
                  : "bg-white/[0.02] border-transparent text-gray-500 hover:bg-white/[0.05]"
              }`}
            >
              {isActive && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
              <div className={`relative z-10 p-2 rounded-lg transition-transform duration-300 ${cat.color} ${isActive ? "scale-110 brightness-125" : ""}`}>
                {cat.icon}
              </div>
              <span className={`relative z-10 text-sm font-medium ${isActive ? "text-white" : "text-gray-500"}`}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      <motion.button
        whileTap={canSubmit ? { scale: 0.94 } : {}}
        onClick={handleAdd}
        disabled={!canSubmit}
        className={`w-full py-5 rounded-[2rem] font-bold text-lg transition-all duration-300 ${
          canSubmit
            ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white shadow-[0_10px_30px_rgba(99,102,241,0.2)]"
            : "bg-white/5 text-gray-400 cursor-not-allowed border border-white/5"
        }`}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : showToast ? (
          "Saved! ✓"
        ) : (
          "Save Transaction"
        )}
      </motion.button>
    </div>
  );
}