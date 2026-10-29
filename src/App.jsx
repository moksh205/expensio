import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { HelmetProvider } from 'react-helmet-async';
import BottomNav from "./components/BottomNav";

// 🔥 Supabase
import { supabase } from "./supabase";
import { parseDate } from "./expenseUtils";

// ✅ PERFORMANCE: Lazy load page components to enable Route-Level Code Splitting
const Home = lazy(() => import("./pages/Home"));
const AddExpense = lazy(() => import("./pages/AddExpense"));
const History = lazy(() => import("./pages/History"));
const Profile = lazy(() => import("./pages/Profile"));
const LoginSignup = lazy(() => import("./pages/LoginSignup"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

// 🔹 Gold loader + wordmark that matches the theme while chunks download
const PageLoader = () => (
  <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 pb-20" role="status" aria-label="Loading">
    <div className="w-9 h-9 border-[3px] border-accent-soft border-t-accent rounded-full animate-spin" />
    <p className="font-display text-lg font-bold">Expensio<span className="text-accent">.</span></p>
  </div>
);

// 🔹 Safe read of guest data (bad JSON won't crash the app)
const readGuestData = () => {
  try {
    return JSON.parse(localStorage.getItem("guest_expenses")) || [];
  } catch {
    return [];
  }
};

// 🔥 SYNC FUNCTION (CORE FEATURE) — keeps date + payment method,
// and only clears local data if the upload actually worked
const syncGuestData = async (userId) => {
  const guestData = readGuestData();
  if (guestData.length === 0) return;

  const formatted = guestData.map((e) => {
    const d = parseDate(e);
    return {
      user_id: userId,
      amount: e.amount,
      category: e.category,
      note: e.note,
      payment_method: e.payment_method || "Online",
      // bad/missing date → let the DB use now() instead of failing the whole sync
      ...(isNaN(d.getTime()) ? {} : { created_at: d.toISOString() }),
    };
  });

  const { error } = await supabase.from("expenses").insert(formatted);
  if (error) {
    console.error("Guest sync failed, keeping local data:", error.message);
    return;
  }

  localStorage.removeItem("guest_expenses");
};

function App() {
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);

  // 🔥 Get logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const syncingRef = useRef(null);
  const userId = user?.id;

  // 🔥 Fetch expenses (DB OR Guest) — also syncs guest data on any login
  useEffect(() => {
    let cancelled = false;

    const fetchExpenses = async () => {
      if (!userId) {
        // 🟡 Guest → load from localStorage
        setExpenses(readGuestData().reverse());
        return;
      }

      // 🔥 sync guest data first — every run waits on the SAME sync,
      // so it never uploads twice and the fetch always sees synced rows
      if (!syncingRef.current) {
        syncingRef.current = syncGuestData(userId).finally(() => {
          syncingRef.current = null;
        });
      }
      await syncingRef.current;

      // 🟢 Logged-in → load from DB
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading expenses:", error.message);
      } else if (!cancelled) {
        setExpenses(data);
      }
    };

    fetchExpenses();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ✅ add expense (UI only)
  const addExpense = (expense) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  // 🔥 delete (guest + user)
  const deleteExpense = async (id) => {
    if (!user) {
      // 🟡 Guest delete
      const updated = readGuestData().filter((e) => e.id !== id);
      localStorage.setItem("guest_expenses", JSON.stringify(updated));
      setExpenses(updated.reverse());
      return true;
    }

    // 🟢 DB delete — only remove from UI if the DB delete worked
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      console.error("Error deleting:", error.message);
      return false;
    }
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    return true;
  };

  // 🔥 reset (guest + user)
  const resetData = async () => {
    if (!user) {
      localStorage.removeItem("guest_expenses");
      setExpenses([]);
      return true;
    }

    const { error } = await supabase.from("expenses").delete().eq("user_id", user.id);
    if (error) {
      console.error("Error clearing data:", error.message);
      return false;
    }
    setExpenses([]);
    return true;
  };

  // 🔥 login (guest sync + fetch happen in the effect above)
  const handleLogin = (supabaseUser) => {
    setUser(supabaseUser);
  };

  // 🔥 logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    // ✅ FIX: HelmetProvider wraps the entire app architecture
    <HelmetProvider>
      <BrowserRouter>
        <div className="bg-bg text-fg min-h-screen">
          
          {/* ✅ PERFORMANCE: Suspense wrapper catches lazy-loaded components */}
          <Suspense fallback={<PageLoader />}>
            {/* ✅ FIX: Routes now ONLY contains Route components */}
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    expenses={expenses}
                    username={user?.email || "Guest"}
                  />
                }
              />

              <Route
                path="/add"
                element={<AddExpense addExpense={addExpense} expenses={expenses} />}
              />

              <Route
                path="/history"
                element={<History expenses={expenses} onDelete={deleteExpense}/>}
              />

              <Route
                path="/profile"
                element={
                  <Profile
                    expenses={expenses}
                    resetData={resetData}
                    user={user}
                    onLogin={handleLogin}
                    onLogout={handleLogout}
                  />
                }
              />

              <Route
                path="/login"
                element={<LoginSignup onLogin={handleLogin} />}
              />
              <Route
                path="/update-password"
                element={<UpdatePassword />}
              />
              <Route
                path="/reset-password"
                element={<ResetPassword />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>

          {/* Persistent UI outside Suspense ensures bottom nav never flashes */}
          <BottomNav />
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;