import {
  Utensils, Bike, ShoppingCart, Receipt,
  Plus, Coffee, Package, MoreHorizontal,
  ShoppingBag, Fuel, Pill, Ticket
} from "lucide-react";

// 🔹 Single source of truth for categories (used by Add, Home, History)
export const CATEGORIES = [
  { name: "Food", Icon: Utensils, color: "orange" },
  { name: "Ride", Icon: Bike, color: "blue" },
  { name: "Blinkit", Icon: Package, color: "yellow" },
  { name: "Zomato", Icon: Plus, color: "red" },
  { name: "Shopping", Icon: ShoppingCart, color: "purple" },
  { name: "Bills", Icon: Receipt, color: "emerald" },
  { name: "Juice", Icon: Coffee, color: "pink" },
  { name: "Grocery", Icon: ShoppingBag, color: "teal" },
  { name: "Fuel", Icon: Fuel, color: "amber" },
  { name: "Health", Icon: Pill, color: "rose" },
  { name: "Entertainment", Icon: Ticket, color: "cyan" },
  { name: "Other", Icon: MoreHorizontal, color: "gray" },
];

// Full class names so Tailwind can detect them at build time
// chip = icon badge, ring = selected ring color, bar = progress bar
const COLOR_CLASSES = {
  orange: { chip: "text-orange-600 bg-orange-500/12 dark:text-orange-400", ring: "ring-orange-500", bar: "bg-orange-500" },
  blue: { chip: "text-blue-600 bg-blue-500/12 dark:text-blue-400", ring: "ring-blue-500", bar: "bg-blue-500" },
  yellow: { chip: "text-yellow-700 bg-yellow-500/15 dark:text-yellow-400", ring: "ring-yellow-500", bar: "bg-yellow-500" },
  red: { chip: "text-red-600 bg-red-500/12 dark:text-red-400", ring: "ring-red-500", bar: "bg-red-500" },
  purple: { chip: "text-purple-600 bg-purple-500/12 dark:text-purple-400", ring: "ring-purple-500", bar: "bg-purple-500" },
  emerald: { chip: "text-emerald-600 bg-emerald-500/12 dark:text-emerald-400", ring: "ring-emerald-500", bar: "bg-emerald-500" },
  pink: { chip: "text-pink-600 bg-pink-500/12 dark:text-pink-400", ring: "ring-pink-500", bar: "bg-pink-500" },
  teal: { chip: "text-teal-600 bg-teal-500/12 dark:text-teal-400", ring: "ring-teal-500", bar: "bg-teal-500" },
  amber: { chip: "text-amber-600 bg-amber-500/15 dark:text-amber-400", ring: "ring-amber-500", bar: "bg-amber-500" },
  rose: { chip: "text-rose-600 bg-rose-500/12 dark:text-rose-400", ring: "ring-rose-500", bar: "bg-rose-500" },
  cyan: { chip: "text-cyan-700 bg-cyan-500/12 dark:text-cyan-400", ring: "ring-cyan-500", bar: "bg-cyan-500" },
  gray: { chip: "text-slate-600 bg-slate-500/12 dark:text-slate-300", ring: "ring-slate-500", bar: "bg-slate-500" },
};

// 🔹 Look up icon + colors for a category name
export const getCategoryStyle = (name, size = 18) => {
  const cat = CATEGORIES.find((c) => c.name === name) || CATEGORIES[CATEGORIES.length - 1];
  const classes = COLOR_CLASSES[cat.color];
  return {
    icon: <cat.Icon size={size} />,
    color: classes.chip,
    ring: classes.ring,
    bar: classes.bar,
  };
};

const KEYWORDS = [
  ["Blinkit", ["blinkit"]],
  ["Zomato", ["zomato", "swiggy"]],
  ["Juice", ["juice", "coconut", "drink", "coffee"]],
  ["Ride", ["ride", "metro", "uber", "ola", "rapido", "auto", "cab"]],
  ["Bills", ["bill", "electric", "rent", "recharge", "internet", "wifi", "broadband"]],
  ["Shopping", ["shopping", "amazon", "flipkart", "myntra", "cloth"]],
  ["Food", ["food", "meal", "lunch", "dinner", "breakfast"]],
  ["Grocery", ["grocer", "supermarket", "vegetable"]],
  ["Fuel", ["fuel", "petrol", "diesel"]],
  ["Health", ["health", "medic", "doctor", "pill", "pharma"]],
  ["Entertainment", ["movie", "ticket", "entertain", "netflix"]],
];

// 🔹 Use the saved category; only guess from the note for "Other" / old data
export const normalizeCategory = (exp) => {
  if (!exp) return "Other";
  const category = String(exp.category || "").trim();
  const known = CATEGORIES.find((c) => c.name.toLowerCase() === category.toLowerCase());
  if (known && known.name !== "Other") return known.name;

  const text = `${category} ${exp.note || ""}`.toLowerCase();
  for (const [name, words] of KEYWORDS) {
    if (words.some((w) => text.includes(w))) return name;
  }
  return "Other";
};

// 🔹 Order categories by recent usage ("frecency"): each use counts,
// recent uses count more (weight halves every 14 days). Unused ones keep
// their default order, and "Other" always stays last.
export const sortCategoriesByUsage = (expenses = []) => {
  const now = Date.now();
  const scores = {};
  for (const exp of expenses) {
    const name = normalizeCategory(exp);
    const t = parseDate(exp).getTime();
    if (isNaN(t)) continue;
    const daysAgo = Math.max(0, (now - t) / 86400000);
    scores[name] = (scores[name] || 0) + Math.pow(0.5, daysAgo / 14);
  }

  const defaultIndex = (name) => CATEGORIES.findIndex((c) => c.name === name);
  return [...CATEGORIES].sort((a, b) => {
    if (a.name === "Other") return 1;
    if (b.name === "Other") return -1;
    const diff = (scores[b.name] || 0) - (scores[a.name] || 0);
    return diff !== 0 ? diff : defaultIndex(a.name) - defaultIndex(b.name);
  });
};

// 🔹 Parse a DB/guest timestamp. Supabase "timestamp" columns come back
// without a timezone, so treat those as UTC (that's how they were saved).
export const parseDate = (exp) => {
  const raw = exp?.created_at || exp?.date;
  if (!raw) return new Date(NaN);
  if (typeof raw === "string" && !/(Z|[+-]\d\d:?\d\d)$/i.test(raw)) {
    return new Date(raw.replace(" ", "T") + "Z");
  }
  return new Date(raw);
};
