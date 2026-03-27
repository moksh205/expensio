import { useState, useEffect } from "react";

export default function Profile({ expenses, resetData }) {
  const [name, setName] = useState("");

  // Load name
  useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (savedName) setName(savedName);
  }, []);

  // Save name
  const handleSave = () => {
    localStorage.setItem("username", name);
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Profile</h1>

      {/* Name */}
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full mt-6 p-4 rounded-xl bg-white/10 text-white outline-none"
      />

      <button
        onClick={handleSave}
        className="w-full mt-4 bg-green-500 p-3 rounded-xl"
      >
        Save Name
      </button>

      {/* Stats */}
      <div className="mt-6 bg-white/10 p-4 rounded-xl">
        <p>Total Expenses: ₹{total}</p>
        <p>Total Entries: {expenses.length}</p>
      </div>

      {/* Reset */}
      <button
        onClick={resetData}
        className="w-full mt-6 bg-red-500 p-3 rounded-xl"
      >
        Reset All Data
      </button>
    </div>
  );
}