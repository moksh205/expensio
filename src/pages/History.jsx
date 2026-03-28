import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, Bike, ShoppingCart, Receipt, 
  Plus, Coffee, Package, MoreHorizontal, Calendar, 
  ChevronRight, ChevronLeft, Trash2, Clock
} from "lucide-react";

export default function History({ expenses = [], onDelete }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedId, setSelectedId] = useState(null);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const categoryIcons = {
    Food: { icon: <Utensils size={14} />, color: "text-orange-400 bg-orange-500/10" },
    Ride: { icon: <Bike size={14} />, color: "text-blue-400 bg-blue-500/10" },
    Blinkit: { icon: <Package size={14} />, color: "text-yellow-400 bg-yellow-500/10" },
    Zomato: { icon: <Plus size={14} />, color: "text-red-400 bg-red-500/10" },
    Shopping: { icon: <ShoppingCart size={14} />, color: "text-purple-400 bg-purple-500/10" },
    Bills: { icon: <Receipt size={14} />, color: "text-emerald-400 bg-emerald-500/10" },
    Juice: { icon: <Coffee size={14} />, color: "text-pink-400 bg-pink-500/10" },
    Other: { icon: <MoreHorizontal size={14} />, color: "text-gray-400 bg-gray-500/10" },
  };

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const categories = ["All", ...Object.keys(categoryIcons)];

  // ✅ CATEGORY NORMALIZATION
  const normalizeCategory = (exp) => {
    const text = `${exp.category || ""} ${exp.note || ""}`.toLowerCase();

    if (text.includes("blinkit")) return "Blinkit";
    if (text.includes("zomato")) return "Zomato";
    if (text.includes("juice") || text.includes("coconut") || text.includes("drink") || text.includes("coffee") || text.includes("tea")) return "Juice";
    if (text.includes("ride") || text.includes("metro") || text.includes("uber") || text.includes("rapido") || text.includes("auto")) return "Ride";
    if (text.includes("bill") || text.includes("electricity") || text.includes("recharge")) return "Bills";
    if (text.includes("shopping") || text.includes("amazon") || text.includes("flipkart") || text.includes("myntra")) return "Shopping";
    if (text.includes("food") || text.includes("meal") || text.includes("lunch") || text.includes("dinner") || text.includes("snack")) return "Food";

    return "Other";
  };

  // ✅ SINGLE SOURCE OF TRUTH (IMPORTANT FIX)
  const processedExpenses = expenses.map(exp => {
    const raw = exp.created_at || exp.date;
    if (!raw) return null;

    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;

    // Apply IST ONLY ONCE
    const local = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));

    return {
      ...exp,
      _date: local,
      _category: normalizeCategory(exp)
    };
  }).filter(Boolean);

  // ✅ FILTER
  const filteredExpenses = processedExpenses.filter(exp => {
    return (
      exp._date.getMonth() === selectedMonth &&
      exp._date.getFullYear() === selectedYear &&
      (activeCategory === "All" || exp._category === activeCategory)
    );
  });

  // ✅ GROUP
  const grouped = filteredExpenses.reduce((acc, exp) => {
    const d = exp._date;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    if (!acc[key]) acc[key] = { items: [], total: 0 };

    acc[key].items.push(exp);
    acc[key].total += Number(exp.amount);

    return acc;
  }, {});

  const dates = Object.keys(grouped).sort().reverse();
  const monthTotal = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleMonthChange = (dir) => {
    if (dir === 'next') {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(prev => prev + 1);
      } else setSelectedMonth(prev => prev + 1);
    } else {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(prev => prev - 1);
      } else setSelectedMonth(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-10 pb-32 max-w-md mx-auto">

      {/* Header */}
      <header className="flex justify-between mb-10">
        <h1 className="text-3xl font-black italic">Activity.</h1>
        <div>₹{monthTotal.toLocaleString('en-IN')}</div>
      </header>

      {/* Month */}
      <div className="flex justify-between mb-6">
        <button onClick={() => handleMonthChange("prev")}><ChevronLeft /></button>
        <span>{months[selectedMonth]} {selectedYear}</span>
        <button onClick={() => handleMonthChange("next")}><ChevronRight /></button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto mb-6">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      {dates.length === 0 ? (
        <p className="text-center text-gray-500">No logs found</p>
      ) : (
        dates.map(date => {
          const [y, m, d] = date.split("-");
          const displayDate = new Date(y, m - 1, d);

          return (
            <div key={date}>
              <h4>{displayDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</h4>

              {grouped[date].items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.note || item._category}</span>
                  <span>₹{item.amount}</span>
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}        <h1 className="text-3xl font-black italic">Activity.</h1>
        <div>₹{monthTotal.toLocaleString('en-IN')}</div>
      </header>

      {/* Month */}
      <div className="flex justify-between mb-6">
        <button onClick={() => handleMonthChange("prev")}><ChevronLeft /></button>
        <span>{months[selectedMonth]} {selectedYear}</span>
        <button onClick={() => handleMonthChange("next")}><ChevronRight /></button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto mb-6">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      {dates.length === 0 ? (
        <p className="text-center text-gray-500">No logs found</p>
      ) : (
        dates.map(date => {
          const [y, m, d] = date.split("-");
          const displayDate = new Date(y, m - 1, d);

          return (
            <div key={date}>
              <h4>{displayDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</h4>

              {grouped[date].items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.note || item._category}</span>
                  <span>₹{item.amount}</span>
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
      {/* Month */}
      <div className="flex justify-between mb-6">
        <button onClick={() => handleMonthChange("prev")}><ChevronLeft /></button>
        <span>{months[selectedMonth]} {selectedYear}</span>
        <button onClick={() => handleMonthChange("next")}><ChevronRight /></button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto mb-6">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      {dates.map(date => {
        const [y, m, d] = date.split("-");
        const displayDate = new Date(y, m - 1, d);

        return (
          <div key={date}>
            <h4>{displayDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</h4>

            {grouped[date].items.map(item => {
              const normalized = normalizeCategory(item);

              return (
                <div key={item.id} className="flex justify-between">
                  <span>{item.note || normalized}</span>
                  <span>₹{item.amount}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
