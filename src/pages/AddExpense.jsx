import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Bike, ShoppingCart, Receipt, Plus, Coffee, Package, MoreHorizontal } from "lucide-react";

export default function AddExpense({ addExpense }) {
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customNote, setCustomNote] = useState("");

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
      amount: Number(amount),
      category: selectedCategory,
      note: finalNote,
      date: new Date().toISOString().split("T")[0],
    });

    setAmount("");
    setSelectedCategory("");
    setCustomNote("");
  };

  return (
    <div className="p-6 max-w-md mx-auto text-white min-h-screen">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Quick Add</h1>

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
          /* 🔹 The classes below remove the up/down arrows (spinners) */
          className="w-full bg-transparent border-b border-white/10 py-4 pl-10 text-5xl font-bold outline-none focus:border-indigo-500 transition-all placeholder:text-white/5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-3 font-semibold">Enter Amount</p>
      </div>

      {/* 🔹 "Other" typing option now directly under Amount */}
      <div className="min-h-[80px]"> {/* Keeps layout stable when input appears */}
        <AnimatePresence>
          {selectedCategory === "Other" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4"
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

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8 mt-4">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${
              selectedCategory === cat.name
                ? "bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)] scale-[0.96]"
                : "bg-white/[0.02] border-transparent hover:bg-white/[0.05]"
            }`}
          >
            <div className={`p-2 rounded-lg ${cat.color}`}>
              {cat.icon}
            </div>
            <span className={`text-sm font-medium ${selectedCategory === cat.name ? "text-white" : "text-gray-400"}`}>
              {cat.name}
            </span>
          </button>
        ))}
      </div>

      {/* Main Action Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={amount && selectedCategory ? { scale: 1.02 } : {}}
        onClick={handleAdd}
        disabled={!amount || !selectedCategory}
        className={`w-full py-5 rounded-[2rem] font-bold text-lg transition-all shadow-xl ${
          amount && selectedCategory
            ? "bg-gradient-to-r from-indigo-600 to-emerald-500 text-white shadow-indigo-500/20 cursor-pointer"
            : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
        }`}
      >
        Save Transaction
      </motion.button>
    </div>
  );
}