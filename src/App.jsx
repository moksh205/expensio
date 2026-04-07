import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, Suspense, lazy } from "react";
import { HelmetProvider } from 'react-helmet-async';
import BottomNav from "./components/BottomNav";

// 🔥 Supabase
import { supabase } from "./supabase";

// ✅ PERFORMANCE: Lazy load page components to enable Route-Level Code Splitting
const Home = lazy(() => import("./pages/Home"));
const AddExpense = lazy(() => import("./pages/AddExpense"));
const History = lazy(() => import("./pages/History"));
const Profile = lazy(() => import("./pages/Profile"));
const LoginSignup = lazy(() => import("./pages/LoginSignup"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));

// 🔹 Sleek loader that matches your dark theme while chunks download
const PageLoader = () => (
  <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center pb-20">
    <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
  </div>
);

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

  // 🔥 Fetch expenses (DB OR Guest)
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) {
        // 🟡 Guest → load from localStorage
        const guestData = JSON.parse(localStorage.getItem("guest_expenses")) || [];
        setExpenses(guestData.reverse());
        return;
      }

      // 🟢 Logged-in → load from DB
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setExpenses(data);
      }
    };

    fetchExpenses();
  }, [user]);

  // ✅ add expense (UI only)
  const addExpense = (expense) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  // 🔥 delete (guest + user)
  const deleteExpense = async (id) => {
    if (!user) {
      // 🟡 Guest delete
      const guestData = JSON.parse(localStorage.getItem("guest_expenses")) || [];
      const updated = guestData.filter((e) => e.id !== id);
      localStorage.setItem("guest_expenses", JSON.stringify(updated));
      setExpenses(updated.reverse());
      return;
    }

    // 🟢 DB delete
    await supabase.from("expenses").delete().eq("id", id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // 🔥 reset (guest + user)
  const resetData = async () => {
    if (!user) {
      localStorage.removeItem("guest_expenses");
      setExpenses([]);
      return;
    }

    await supabase.from("expenses").delete().eq("user_id", user.id);
    setExpenses([]);
  };

  // 🔥 SYNC FUNCTION (CORE FEATURE)
  const syncGuestData = async (user) => {
    const guestData = JSON.parse(localStorage.getItem("guest_expenses")) || [];

    if (guestData.length === 0) return;

    const formatted = guestData.map((e) => ({
      user_id: user.id,
      amount: e.amount,
      category: e.category,
      note: e.note,
    }));

    await supabase.from("expenses").insert(formatted);

    localStorage.removeItem("guest_expenses");
  };

  // 🔥 login + sync
  const handleLogin = async (supabaseUser) => {
    setUser(supabaseUser);

    // 🔥 sync guest data
    await syncGuestData(supabaseUser);

    // 🔥 fetch fresh data from DB
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", supabaseUser.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setExpenses(data);
    }
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
        <div className="bg-[#0f0f0f] text-white min-h-screen pb-20">
          
          {/* ✅ PERFORMANCE: Suspense wrapper catches lazy-loaded components */}
          <Suspense fallback={<PageLoader />}>
            {/* ✅ FIX: Routes now ONLY contains Route components */}
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    expenses={expenses}
                    onDelete={deleteExpense}
                    username={user?.email || "Guest"}
                  />
                }
              />

              <Route
                path="/add"
                element={<AddExpense addExpense={addExpense} />}
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