import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, Bike, ShoppingCart, Receipt, 
  Plus, Coffee, Package, MoreHorizontal, CheckCircle2 
} from "lucide-react";

export default function AddExpense({ addExpense }) {
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [showToast, setShowToast] = useState(false);

  const categories = [
    { name: "Food", icon: <Utensils size={18} />, color: "bg-orange-500/20 text-orange-400" },
    { name: "Ride", icon: <Bike size={18} />, color: "bg-blue-500/20 text-blue-400" },
    { name: "Blinkit", icon: <Package size={18} />, color: "bg-yellow-500/20 text-yellow-400" },
    { name: "Zomato", icon: <Plus size={18} />, color: "bg-red-500/20 text-red-400" },
    { name: "Shopping", icon: <ShoppingCart size={18} />, color: "bg-purple-500/20 text-purple-400" },
    { name: "Bills", icon: <Receipt size={18} />, color: "bg-emerald-500/20 text-emerald-400" },
    { name: "Juice", icon: <Coffee size={18} />, color: "bg-pink-500/20 text-pink-400" },
    { name: "Other", icon: <MoreHorizontal size={18} />, color: "bg-gray-500/20 text-gray-400" },
  ];

  const handleAdd = () => {
    if (!amount || !selectedCategory) return;
    const finalNote = selectedCategory === "Other" ? customNote : selectedCategory;
    
    addExpense({
      id: Date.now(),
      amount: Number(amount),
      category: selectedCategory,
      note: finalNote,
      date: new Date().toISOString().split("T")[0],
    });

    // 🔹 Show Success Feedback
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // Reset fields
    setAmount("");
    setSelectedCategory("");
    setCustomNote("");
  };

  return (
    <div className="relative p-6 max-w-md mx-auto text-white min-h-screen bg-[#050505] overflow-hidden">
      
      {/* 🔹 SUCCESS TOAST POPUP */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -100, x: "-50%" }}
            className="fixed top-6 left-1/2 z-[100] w-[90%] max-w-xs"
          >
            <div className="bg-emerald-500/10 border border-emerald-500/50 backdrop-blur-xl p-4 rounded-3xl flex items-center gap-3 shadow-[0_20px_40px_rgba(16,185,129,0.2)]">
              <div className="bg-emerald-500 rounded-full p-1">
                <CheckCircle2 size={20} className="text-black" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-400">Saved Successfully</p>
                <p className="text-[10px] text-emerald-500/60 uppercase tracking-widest font-bold">Transaction Added</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-2xl font-bold tracking-tight mb-8 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
        Quick Add
      </h1>

      {/* Amount Input Section */}
      <div className="relative group mb-2">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-light text-gray-500 group-focus-within:text-indigo-400 transition-colors">₹</span>
        <input
          type="number"
          inputMode="decimal" 
          placeholder="0"
          value={amount}
          autoFocus
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-transparent border-b border-white/10 py-4 pl-10 text-5xl font-bold outline-none focus:border-indigo-500 transition-all placeholder:text-white/5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-3 font-bold">Transaction Amount</p>
      </div>

      {/* Dynamic Typing Option (Directly under Amount) */}
      <div className="min-h-[85px]">
        <AnimatePresence mode="wait">
          {selectedCategory === "Other" && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <input
                type="text"
                placeholder="What for? (e.g. Medicine, Gift)"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full p-4 rounded-2xl bg-white/[0.05] border border-indigo-500/30 outline-none focus:border-indigo-500 transition-all text-indigo-100 placeholder:text-gray-600 shadow-inner"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories Grid with Dynamic Glow */}
      <div className="grid grid-cols-2 gap-3 mb-10 mt-2">
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
              {isActive && (
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
              )}

              <div className={`relative z-10 p-2 rounded-lg transition-transform duration-300 ${cat.color} ${isActive ? "scale-110 brightness-125" : ""}`}>
                {cat.icon}
              </div>
              
              <span className={`relative z-10 text-sm font-medium transition-colors ${isActive ? "text-white" : "text-gray-500"}`}>
                {cat.name}
              </span>

              {isActive && (
                <motion.div 
                  layoutId="active-selection-indicator"
                  className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Action Button */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        whileHover={amount && selectedCategory ? { scale: 1.02, translateY: -2 } : {}}
        onClick={handleAdd}
        disabled={!amount || !selectedCategory}
        className={`w-full py-5 rounded-[2rem] font-bold text-lg transition-all duration-300 shadow-2xl ${
          amount && selectedCategory
            ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white shadow-indigo-500/25 cursor-pointer"
            : "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
        }`}
      >
        {showToast ? "Saved! ✓" : "Save Transaction"}
      </motion.button>
    </div>
  );
}