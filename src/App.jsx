import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import AddExpense from "./pages/AddExpense";
import History from "./pages/History";
import BottomNav from "./components/BottomNav";
import Profile from "./pages/Profile";
import LoginSignup from "./pages/LoginSignup";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);

  // ✅ load user 
  useEffect(() => {
    const savedUser = localStorage.getItem("username");
    if (savedUser) setUser(savedUser);
  }, []);

  // ✅ add expense
  const addExpense = (expense) => {
    setExpenses((prev) => [...prev, expense]);
  };

  // ✅ delete expense
  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // ✅ reset data
  const resetData = () => {
    setExpenses([]);
    if (user) {
      localStorage.removeItem(`expenses_${user}`);
    }
  };

  // ✅ login
  const handleLogin = (name) => {
    if (!name) return;
    localStorage.setItem("username", name);
    setUser(name);
  };

  // ✅ logout
  const handleLogout = () => {
    localStorage.removeItem("username");
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="bg-[#0f0f0f] text-white min-h-screen pb-20">

        <Routes>
          <Route
            path="/"
            element={
              <Home
                expenses={expenses}
                onDelete={deleteExpense}
                username={user}
              />
            }
          />

          <Route path="/add" element={<AddExpense addExpense={addExpense} />} />

          <Route path="/history" element={<History expenses={expenses} />} />

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
          <Route path="/login" element={<LoginSignup onLogin={handleLogin} />} />
        </Routes>

        
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;