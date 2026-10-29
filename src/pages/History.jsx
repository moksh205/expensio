import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, ChevronRight, ChevronLeft, Trash2,
  CreditCard, Wallet, TrendingUp, TrendingDown, X
} from "lucide-react";
import SEO from '../components/SEO';
import BarChart from '../components/BarChart';
import { CATEGORIES, getCategoryStyle, normalizeCategory, parseDate } from '../expenseUtils';

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const label = 'text-xs font-semibold uppercase tracking-[0.18em] text-muted';
const inr = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function History({ expenses = [], onDelete }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const categories = ["All", ...CATEGORIES.map((c) => c.name)];

  const processedExpenses = useMemo(() => {
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    return safeExpenses.reduce((acc, exp) => {
      const localDate = parseDate(exp);
      if (isNaN(localDate.getTime())) return acc;

      const normalized = normalizeCategory(exp);

      acc.push({ ...exp, localDate, normalized });
      return acc;
    }, []).sort((a, b) => b.localDate - a.localDate); // newest first inside each day
  }, [expenses]);

  const inMonth = (exp, m, y) => exp.localDate.getMonth() === m && exp.localDate.getFullYear() === y;
  const matchesPayment = (exp) => paymentFilter === "All" || (exp.payment_method || "Online") === paymentFilter;
  const matchesCategory = (exp) => activeCategory === "All" || exp.normalized === activeCategory;

  // Month + payment (ignores category) → used for the "Top categories" card
  const monthPaymentExpenses = useMemo(
    () => processedExpenses.filter((e) => inMonth(e, selectedMonth, selectedYear) && matchesPayment(e)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processedExpenses, selectedMonth, selectedYear, paymentFilter]
  );

  const filteredExpenses = useMemo(
    () => monthPaymentExpenses.filter(matchesCategory),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthPaymentExpenses, activeCategory]
  );

  const grouped = useMemo(() => {
    return filteredExpenses.reduce((acc, exp) => {
      const d = exp.localDate;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      if (!acc[key]) acc[key] = { items: [], total: 0 };
      acc[key].items.push(exp);
      acc[key].total += (Number(exp.amount) || 0);

      return acc;
    }, {});
  }, [filteredExpenses]);

  const dates = useMemo(() => Object.keys(grouped).sort().reverse(), [grouped]);
  const sum = (list) => list.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const monthTotal = sum(filteredExpenses);

  // Same filters, previous month → "vs last month"
  const prevM = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const prevY = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
  const prevTotal = sum(processedExpenses.filter((e) => inMonth(e, prevM, prevY) && matchesPayment(e) && matchesCategory(e)));
  const change = prevTotal > 0 ? Math.round(((monthTotal - prevTotal) / prevTotal) * 100) : null;

  // Average per day: days so far for this month, full month for past months
  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
  const isFuture = selectedYear > now.getFullYear() || (selectedYear === now.getFullYear() && selectedMonth > now.getMonth());
  const daysCounted = isCurrentMonth ? now.getDate() : new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const avgPerDay = !isFuture && daysCounted ? monthTotal / daysCounted : 0;

  const handleMonthChange = (dir) => {
    setSelectedId(null);
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

  // "Today" / "Yesterday" / "Mon, 27 Oct"
  const formatDay = (date) => {
    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    if (date.toDateString() === now.toDateString()) return "Today";
    if (date.toDateString() === yest.toDateString()) return "Yesterday";
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // One bar per day of the selected month (respects all filters)
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const value = filteredExpenses.reduce((s, e) => e.localDate.getDate() === day ? s + (Number(e.amount) || 0) : s, 0);
    return {
      key: String(day),
      label: String(day),
      tip: new Date(selectedYear, selectedMonth, day).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
      value,
    };
  });

  const isFiltered = activeCategory !== "All" || paymentFilter !== "All";
  const clearFilters = () => { setActiveCategory("All"); setPaymentFilter("All"); setSelectedId(null); };

  return (
    <div className="min-h-screen px-4 pt-safe pb-nav max-w-md mx-auto">
      <SEO
        title="History - Expensio"
        description="View and analyze your expense history with smart filters."
      />

      {/* Header — original "Timeline / Activity." with total box */}
      <header className="flex items-center justify-between mb-6 gap-3 px-1">
        <div>
          <p className={label}>Timeline</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Activity<span className="text-accent">.</span>
          </h1>
        </div>
        <div className="card rounded-2xl px-4 py-2.5 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{isFiltered ? "Filtered total" : "Total"}</p>
          <p className="font-display text-xl font-bold tabular-nums">{inr(monthTotal)}</p>
        </div>
      </header>

      {/* Month switcher — centered pill */}
      <div className="card rounded-full flex items-center justify-between p-1 mx-auto max-w-[260px] mb-4">
        <button onClick={() => handleMonthChange("prev")} aria-label="Previous month" className="w-11 h-11 rounded-full text-muted hover:text-fg hover:bg-surface-2 flex items-center justify-center transition-colors active:scale-95">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center" aria-live="polite">
          <p className="text-sm font-bold uppercase tracking-[0.18em]">{MONTHS[selectedMonth]}</p>
          <p className="text-xs text-muted tabular-nums">{selectedYear}</p>
        </div>
        <button onClick={() => handleMonthChange("next")} aria-label="Next month" className="w-11 h-11 rounded-full text-muted hover:text-fg hover:bg-surface-2 flex items-center justify-center transition-colors active:scale-95">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Daily chart */}
      <section className="card rounded-[2rem] p-5 mb-3">
        <div className="flex items-baseline justify-between">
          <p className={label}>Daily spend</p>
          <p className="text-xs text-muted tabular-nums">
            {filteredExpenses.length} {filteredExpenses.length === 1 ? "log" : "logs"} · {inr(Math.round(avgPerDay))}/day
            {change !== null && (
              <span className={`ml-1.5 font-semibold ${change > 0 ? "text-red-500 dark:text-red-400" : "text-cash dark:text-emerald-400"}`}>
                {change > 0 ? "▲" : "▼"} {Math.abs(change)}%
              </span>
            )}
          </p>
        </div>
        <BarChart
          data={dailyData}
          title={`Daily spending in ${MONTHS[selectedMonth]}`}
          height={64}
          highlightKey={isCurrentMonth ? String(now.getDate()) : undefined}
          format={inr}
          showLabel={(i) => i === 0 || (i + 1) % 7 === 0 || i === dailyData.length - 1}
        />
      </section>

      {/* Sticky filters */}
      <div className="sticky z-30 -mx-4 px-4 py-2 bg-bg/80 backdrop-blur-xl" style={{ top: "env(safe-area-inset-top)" }}>
        <div className="flex items-center gap-2">
          <div className="relative flex flex-1 p-1 bg-surface-2 rounded-full">
            {["All", "Online", "Cash"].map(method => {
              const isActive = paymentFilter === method;
              return (
                <button
                  key={method}
                  onClick={() => {
                    setPaymentFilter(method);
                    setSelectedId(null);
                  }}
                  aria-pressed={isActive}
                  className={`relative flex-1 flex justify-center items-center gap-1.5 min-h-11 text-sm font-semibold z-10 transition-colors ${
                    isActive ? "text-fg" : "text-muted"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePaymentTab"
                      className="absolute inset-0 bg-surface rounded-full shadow-card -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {method === "Online" && <CreditCard size={14} />}
                  {method === "Cash" && <Wallet size={14} />}
                  {method}
                </button>
              );
            })}
          </div>
          {isFiltered && (
            <button onClick={clearFilters} aria-label="Clear filters" className="glass w-11 h-11 shrink-0 rounded-full text-muted hover:text-fg flex items-center justify-center active:scale-95">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pt-2">
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            const style = cat === "All" ? null : getCategoryStyle(cat, 14);

            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedId(null);
                }}
                aria-pressed={isActive}
                className={`flex items-center gap-1.5 px-4 min-h-11 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                  isActive
                  ? "bg-fg text-bg border-fg"
                  : "bg-surface border-line text-muted hover:text-fg"
                }`}
              >
                {style && <span className={isActive ? "" : style.color.split(" ").filter((c) => c.includes("text-")).join(" ")}>{style.icon}</span>}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transactions List */}
      <AnimatePresence mode="popLayout">
        {dates.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card border-dashed mt-4 p-8 text-center">
            <div className="w-14 h-14 bg-accent-soft text-accent rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar size={24} />
            </div>
            <p className="font-semibold">No expenses found</p>
            <p className="text-sm text-muted mt-1">
              {isFiltered ? "Nothing matches these filters." : `Nothing logged in ${MONTHS[selectedMonth]}.`}
            </p>
            {isFiltered && (
              <button onClick={clearFilters} className="mt-4 inline-flex items-center min-h-11 px-5 rounded-full bg-surface-2 text-sm font-semibold active:scale-95">
                Clear filters
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div key="list" className="mt-3 space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {dates.map(date => {
              const [y, m, d] = date.split("-");
              const displayDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));

              if (isNaN(displayDate.getTime())) return null;

              return (
                <motion.section layout key={date} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                  {/* Date Group Header */}
                  <div className="flex items-center mb-3">
                    <h2 className="px-3 py-1.5 rounded-lg bg-surface-2 border border-line text-xs font-semibold uppercase tracking-[0.14em] text-muted">{formatDay(displayDate)}</h2>
                    <div className="h-px flex-1 mx-3 bg-linear-to-r from-line to-transparent" aria-hidden="true" />
                    <span className="text-sm font-medium text-muted tabular-nums">{inr(grouped[date].total)}</span>
                  </div>

                  {/* One card per day, rows divided */}
                  <div className="space-y-2.5">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {grouped[date].items.map((item) => {
                        const categoryData = getCategoryStyle(item.normalized);
                        const isCash = item.payment_method === "Cash";

                        // Universal stable ID for mapping, selection, and deletion
                        const stableId = item.id || item.created_at || item.date;
                        const isSelected = selectedId === stableId;

                        return (
                          <motion.div
                            layout
                            key={stableId}
                            exit={{ opacity: 0, height: 0 }}
                            className="card rounded-[1.75rem] relative overflow-hidden"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (typeof onDelete === 'function') {
                                  onDelete(stableId);
                                }
                                setSelectedId(null);
                              }}
                              aria-label="Delete expense"
                              className={`absolute right-0 inset-y-0 w-20 bg-red-500 flex flex-col items-center justify-center gap-0.5 text-white text-xs font-semibold active:bg-red-600 ${isSelected ? "" : "invisible"}`}
                            >
                              <Trash2 size={18} /> Delete
                            </button>

                            <motion.div
                              animate={{ x: isSelected ? -80 : 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 35 }}
                              onClick={() => setSelectedId(isSelected ? null : stableId)}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedId(isSelected ? null : stableId); } }}
                              role="button"
                              tabIndex={0}
                              aria-expanded={isSelected}
                              aria-label={`${item.note || item.normalized}, ${inr(Number(item.amount) || 0)}. Show delete`}
                              className="relative z-10 bg-surface px-4 py-3.5 flex justify-between items-center gap-3 cursor-pointer hover:bg-surface-2 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center ${categoryData.color}`}>
                                  {categoryData.icon}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {item.note || item.normalized}
                                  </p>
                                  <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                                    {item.localDate.toLocaleTimeString("en-IN", {
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                    <span aria-hidden="true">·</span>
                                    {isCash ? <Wallet size={12} className="text-cash" /> : <CreditCard size={12} className="text-online" />}
                                    {item.payment_method || "Online"}
                                  </p>
                                </div>
                              </div>
                              <p className="font-display font-semibold tabular-nums shrink-0">
                                {inr(Number(item.amount) || 0)}
                              </p>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </motion.section>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
