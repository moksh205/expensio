import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import AddExpense from "./pages/AddExpense";
import History from "./pages/History";
import BottomNav from "./components/BottomNav";
import Profile from "./pages/Profile";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const addExpense = (expense) => {
    setExpenses((prev) => [...prev, expense]);
};
const deleteExpense = (id) => {
  setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <BrowserRouter>
      <div className="bg-[#0f0f0f] text-white min-h-screen pb-20">
        <Routes>
          <Route path="/" element={<Home expenses={expenses} 
          onDelete={deleteExpense}
          username={user}/>} />
          <Route path="/add" element={<AddExpense addExpense={addExpense} />} />
          <Route path="/history" element={<History expenses={expenses} 
          onDelete={deleteExpense}
          />} />
          <Route path="/profile" element={<Profile expenses={expenses} />} />
        </Routes>

        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;