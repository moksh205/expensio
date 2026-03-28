import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, Bike, ShoppingCart, Receipt, 
  Plus, Coffee, Package, MoreHorizontal, CheckCircle2, Loader2 
} from "lucide-react";

import { supabase } from "../supabase";

export default function AddExpense({ addExpense }) {
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleAdd = async () => {
    const amt = Number(amount);

    // ✅ VALIDATION
    if (!amt || amt <= 0 || !selectedCategory) return;

    if (selectedCategory === "Other" && !customNote.trim()) {
      alert("Please enter a note for 'Other'");
      return;
    }

    setLoading(true);

    const finalNote =
      selectedCategory === "Other"
        ? customNote.trim()
        : selectedCategory;

    const expenseData = {
      id: Date.now(),
      amount: amt,
      category: selectedCategory,
      note: finalNote,
      created_at: new Date().toISOString(), // ✅ IMPORTANT
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // 🟡 Guest mode
        const guestData =
          JSON.parse(localStorage.getItem("guest_expenses")) || [];

        guestData.push(expenseData);

        localStorage.setItem("guest_expenses", JSON.stringify(guestData));

        addExpense(expenseData);
      } else {
        const { data, error } = await supabase
          .from("expenses")
          .insert([
            {
              user_id: user.id,
              amount: expenseData.amount,
              category: expenseData.category,
              note: expenseData.note,
              created_at: expenseData.created_at, // ✅ FIXED
            },
          ])
          .select();

        if (error) throw error;

        addExpense(data[0]);
      }

      // ✅ SUCCESS UI
      setShowToast(true);
      setAmount("");
      setSelectedCategory("");
      setCustomNote("");

      setTimeout(() => setShowToast(false), 2500);

    } catch (err) {
      console.error("Error saving:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative p-6 max-w-md mx-auto text-white min-h-screen bg-[#050505]">

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -80, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -80, x: "-50%" }}
            className="fixed top-6 left-1/2 z-50 w-[90%] max-w-xs"
          >
            <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-3xl flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">
                Saved Successfully
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Amount */}
      <div className="flex flex-col items-center mb-8 mt-6">
        <span className="text-gray-500 text-xs mb-2">Amount</span>

        <div className="flex items-center border-b border-white/10">
          <span className="text-4xl text-gray-500 mr-2">₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-transparent text-5xl text-center outline-none"
          />
        </div>
      </div>

      {/* Other input */}
      {selectedCategory === "Other" && (
        <input
          type="text"
          placeholder="Enter note"
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
          className="w-full p-3 mb-4 bg-white/5 rounded-xl outline-none"
        />
      )}

      {/* Categories */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`p-4 rounded-xl flex items-center gap-2 ${
              selectedCategory === cat.name
                ? "bg-white text-black"
                : "bg-white/5 text-gray-400"
            }`}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Button */}
      <button
        onClick={handleAdd}
        disabled={loading}
        className="w-full py-4 bg-indigo-600 rounded-xl flex justify-center items-center"
      >
        {loading ? <Loader2 className="animate-spin" /> : "Save"}
      </button>
    </div>
  );
}
