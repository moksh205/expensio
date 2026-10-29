import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Award, Wallet, CreditCard, Plus, TrendingUp, TrendingDown, Receipt, ArrowLeftRight } from 'lucide-react';
import SEO from '../components/SEO';
import ThemeToggle from '../components/ThemeToggle';
import BarChart from '../components/BarChart';
import { CATEGORIES, getCategoryStyle, normalizeCategory, parseDate } from '../expenseUtils';

const inr = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const AnimatedNumber = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    Math.round(latest).toLocaleString("en-IN")
  );

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

export default function Home({ expenses = [], username }) {
  const [showTotal, setShowTotal] = useState(false);

  // ✅ State to toggle Cash/Online split between month and all time
  const [isPaymentMonthly, setIsPaymentMonthly] = useState(false);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const inMonth = (d, m = currentMonth, y = currentYear) => d.getMonth() === m && d.getFullYear() === y;

  const monthlyTotal = expenses.reduce((sum, e) => inMonth(parseDate(e)) ? sum + Number(e.amount) : sum, 0);
  const overallTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthTotal = expenses.reduce((sum, e) => inMonth(parseDate(e), prevM, prevY) ? sum + Number(e.amount) : sum, 0);
  const change = prevMonthTotal > 0 ? Math.round(((monthlyTotal - prevMonthTotal) / prevMonthTotal) * 100) : null;

  const sameDay = (a, b) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  const todayTotal = expenses.reduce((sum, e) => sameDay(parseDate(e), today) ? sum + Number(e.amount) : sum, 0);

  // Last 7 days for the mini chart (today on the right)
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const value = expenses.reduce((s, e) => sameDay(parseDate(e), d) ? s + Number(e.amount) : s, 0);
    return {
      key: d.toDateString(),
      label: d.toLocaleDateString("en-IN", { weekday: "narrow" }),
      tip: i === 6 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
      value,
    };
  });
  const weekTotal = week.reduce((s, d) => s + d.value, 0);

  const noteTotals = expenses.reduce((acc, exp) => {
    if (inMonth(parseDate(exp))) {
      let raw = (exp.note || "").toString().trim().toLowerCase();

      const ignoreWords = CATEGORIES.map((c) => c.name.toLowerCase());
      if (!raw || ignoreWords.includes(raw)) return acc;

      let key = raw;
      if (raw.includes("electric") || raw.includes("light bill")) key = "electricity";
      else if (raw.includes("cloth")) key = "clothes";
      else if (raw.includes("rent")) key = "rent";
      else if (raw.includes("grocery") || raw.includes("grocer")) key = "grocery";
      else if (raw.includes("fuel") || raw.includes("petrol") || raw.includes("diesel")) key = "fuel";
      else if (raw.includes("wifi") || raw.includes("internet") || raw.includes("broadband")) key = "internet";
      else if (raw.includes("recharge")) key = "recharge";

      acc[key] = (acc[key] || 0) + Number(exp.amount);
    }
    return acc;
  }, {});

  let topItemEntry = Object.entries(noteTotals)
    .filter(([, val]) => val > 0)
    .sort((a, b) => b[1] - a[1])[0] || null;

  const categoryTotals = expenses.reduce((acc, exp) => {
    if (inMonth(parseDate(exp))) {
      const normalized = normalizeCategory(exp);
      acc[normalized] = (acc[normalized] || 0) + Number(exp.amount);
    }
    return acc;
  }, {});

  const topCategoryEntry = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0] || null;

  const isCategoryBigger = topCategoryEntry && topItemEntry && topCategoryEntry[1] > topItemEntry[1];
  const isNotOtherBucket = topCategoryEntry && topCategoryEntry[0] !== "Other";

  if (!topItemEntry || (isCategoryBigger && isNotOtherBucket)) {
    topItemEntry = topCategoryEntry;
  }

  let topItemPercentage = 0;
  let displayPercentage = "0%";

  if (topItemEntry && monthlyTotal > 0) {
    const rawPercentage = (topItemEntry[1] / monthlyTotal) * 100;
    topItemPercentage = Math.round(rawPercentage);

    if (topItemPercentage === 0 && rawPercentage > 0) {
      displayPercentage = "<1%";
    } else {
      displayPercentage = `${topItemPercentage}%`;
    }
  }

  const displayTopName = topItemEntry
    ? topItemEntry[0].charAt(0).toUpperCase() + topItemEntry[0].slice(1)
    : "";

  // ✅ Calculate BOTH Monthly and All-Time Payment splits
  const paymentStats = expenses.reduce((acc, exp) => {
    const method = exp.payment_method || "Online";
    const amt = Number(exp.amount) || 0;
    const isCurrentMonth = inMonth(parseDate(exp));

    if (method === "Cash") {
      acc.allCash += amt;
      if (isCurrentMonth) acc.moCash += amt;
    } else {
      acc.allOnline += amt;
      if (isCurrentMonth) acc.moOnline += amt;
    }

    return acc;
  }, { allCash: 0, moCash: 0, allOnline: 0, moOnline: 0 });

  const displayCash = isPaymentMonthly ? paymentStats.moCash : paymentStats.allCash;
  const displayOnline = isPaymentMonthly ? paymentStats.moOnline : paymentStats.allOnline;

  const monthName = today.toLocaleDateString("en-IN", { month: "long" });
  let savedName = "";
  try {
    savedName = localStorage.getItem("username") || "";
  } catch {
    // storage blocked → fall back to email / "Welcome"
  }
  const displayName = savedName || (username && username !== "Guest" ? username.split("@")[0] : "Welcome");
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const label = "text-xs font-semibold uppercase tracking-[0.18em] text-muted";

  return (
    <div className="min-h-screen px-4 pt-safe pb-nav max-w-md mx-auto">
      <SEO
        title="Expensio – Smart Expense Tracker"
        description="Track your daily expenses, manage money, and gain insights with Expensio."
      />

      {/* Header — original "Dashboard / Expensio." wordmark */}
      <header className="flex justify-between items-center mb-7 px-1">
        <div className="min-w-0">
          <p className={label}>{greeting}{savedName ? `, ${displayName}` : ""}</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Expensio<span className="text-accent">.</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/profile"
            aria-label="Profile"
            className="w-11 h-11 rounded-2xl bg-surface border border-line flex items-center justify-center text-sm font-bold uppercase text-accent active:scale-95 transition-transform"
          >
            {username && username !== "Guest" ? username.slice(0, 2) : "GU"}
          </Link>
        </div>
      </header>

      {/* Hero — one big number (tap to switch month / lifetime) + 7-day chart */}
      <section className="card rounded-[2.5rem] p-6 mb-4 relative overflow-hidden">
        <div className="absolute -left-16 -top-16 w-56 h-56 rounded-full bg-accent-soft blur-3xl pointer-events-none" />
        <button
          onClick={() => setShowTotal(!showTotal)}
          aria-label={`${showTotal ? "Lifetime" : "Monthly"} spend. Tap to switch`}
          className="relative w-full text-center"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 border border-line text-xs font-semibold uppercase tracking-[0.18em] text-fg/80">
            {showTotal ? "Lifetime spend" : `${monthName} spend`}
            <ArrowLeftRight size={12} className="text-accent" />
          </span>
          <span className="mt-4 flex items-baseline justify-center gap-1">
            <span className="text-2xl font-light text-muted">₹</span>
            <span className="font-display text-6xl font-extrabold tracking-tight tabular-nums text-gradient">
              <AnimatedNumber value={showTotal ? overallTotal : monthlyTotal} />
            </span>
          </span>
          <span className="mt-2 block text-xs text-muted">
            {!showTotal && change !== null ? (
              <span className={`inline-flex items-center gap-1 font-semibold ${change > 0 ? "text-red-500 dark:text-red-400" : "text-cash dark:text-emerald-400"}`}>
                {change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {change > 0 ? "+" : ""}{change}% vs last month
              </span>
            ) : (
              "Tap to switch"
            )}
          </span>
        </button>

        <div className="relative mt-5 pt-4 border-t border-line">
          <div className="flex items-baseline justify-between">
            <p className={label}>Last 7 days</p>
            <p className="text-xs font-semibold tabular-nums">{inr(weekTotal)}</p>
          </div>
          <BarChart
            data={week}
            title="Spending over the last 7 days"
            height={60}
            highlightKey={week[6].key}
            format={inr}
          />
        </div>
      </section>

      {/* Tiles — same simple 2×2 as the original */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card rounded-[2rem] p-5 flex flex-col justify-between min-h-28">
          <p className={label}>Today</p>
          <p className="font-display text-2xl font-bold tabular-nums truncate text-cash dark:text-emerald-400">{inr(todayTotal)}</p>
        </div>
        <div className="card rounded-[2rem] p-5 flex flex-col justify-between min-h-28">
          <p className={label}>Logs</p>
          <p className="font-display text-2xl font-bold tabular-nums truncate">{expenses.length}</p>
        </div>

        {/* Cash / Online — tap either to switch month ↔ all time */}
        {[
          { name: "Cash", value: displayCash, Icon: Wallet, tone: "text-cash dark:text-emerald-400" },
          { name: "Online", value: displayOnline, Icon: CreditCard, tone: "text-accent" },
        ].map(({ name, value, Icon, tone }) => (
          <motion.button
            key={name}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsPaymentMonthly(!isPaymentMonthly)}
            aria-label={`${name}: ${inr(value)} ${isPaymentMonthly ? "this month" : "all time"}. Tap to switch`}
            className="card rounded-[2rem] p-5 flex flex-col justify-between min-h-28 text-left"
          >
            <span className="flex items-center justify-between gap-2">
              <span className={`${label} flex items-center gap-1.5`}><Icon size={13} className={tone} /> {name}</span>
              <span className="text-xs font-medium text-muted bg-surface-2 px-2 py-0.5 rounded-md">
                {isPaymentMonthly ? "Month" : "All"}
              </span>
            </span>
            <span className={`font-display text-2xl font-bold tabular-nums truncate ${tone}`}>
              ₹<AnimatedNumber value={value} />
            </span>
          </motion.button>
        ))}
      </div>

      {/* Top spending */}
      {topItemEntry && (() => {
        const normalized = normalizeCategory({
          category: topItemEntry[0],
          note: topItemEntry[0] || ""
        });
        const categoryData = getCategoryStyle(normalized);

        return (
          <Link to="/history" className="card rounded-[2rem] p-5 block active:scale-[0.99] transition-transform">
            <div className="flex justify-between items-center gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center ${categoryData.color}`}>
                  {categoryData.icon}
                </div>
                <div className="min-w-0">
                  <p className={`${label} flex items-center gap-1`}>
                    <Award size={12} className="text-accent" /> Top spending
                  </p>
                  <p className="font-semibold truncate">{displayTopName}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-xl font-bold tabular-nums">{inr(topItemEntry[1])}</p>
                <p className="text-xs text-muted">{displayPercentage} of month</p>
              </div>
            </div>
            <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${topItemPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-linear-to-r from-primary-2 to-primary"
              />
            </div>
          </Link>
        );
      })()}

      {/* Empty state: invite to add the first expense */}
      {expenses.length === 0 && (
        <div className="card border-dashed rounded-[2rem] p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-accent-soft text-accent flex items-center justify-center"><Receipt size={24} /></div>
          <p className="font-semibold">No expenses yet</p>
          <p className="text-sm text-muted mt-1 mb-4">Add your first one to see your stats.</p>
          <Link to="/add" className="inline-flex items-center gap-1.5 bg-linear-to-br from-primary to-primary-2 text-on-primary text-sm font-semibold px-5 min-h-11 rounded-full active:scale-95 transition-transform">
            <Plus size={16} /> Add expense
          </Link>
        </div>
      )}
    </div>
  );
}
