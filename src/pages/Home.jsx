import React from 'react';

export default function Home({ expenses = [] }) {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Calculations
  const monthlyTotal = expenses.reduce((sum, e) => {
    const d = new Date(e.date);
    return (d.getMonth() === currentMonth && d.getFullYear() === currentYear) ? sum + e.amount : sum;
  }, 0);

  const todayTotal = expenses
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);

  const grouped = expenses.reduce((acc, exp) => {
    acc[exp.date] = (acc[exp.date] || 0) + exp.amount;
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort().reverse().slice(0, 5);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-sans selection:bg-indigo-500/30">
      {/* Background Glows (The Secret Sauce) */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full -z-10" />

      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Expensio.
        </h1>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 p-[1px]">
           <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px]">JD</div>
        </div>
      </header>

      {/* Hero Monthly Card */}
      <div className="relative overflow-hidden bg-white/[0.03] border border-white/10 backdrop-blur-md p-6 rounded-[2rem] mb-6 group transition-all hover:border-white/20">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-medium">Monthly Spending</p>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-2xl font-light text-indigo-400">₹</span>
          <h2 className="text-5xl font-bold tracking-tighter">{monthlyTotal.toLocaleString()}</h2>
        </div>
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/[0.03] border border-white/5 p-5 rounded-[1.5rem] hover:bg-white/[0.05] transition-colors">
          <p className="text-xs text-gray-500 mb-1">Today</p>
          <p className="text-xl font-semibold text-emerald-400">₹{todayTotal}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/5 p-5 rounded-[1.5rem] hover:bg-white/[0.05] transition-colors">
          <p className="text-xs text-gray-500 mb-1">Entries</p>
          <p className="text-xl font-semibold text-gray-200">{expenses.length}</p>
        </div>
      </div>

      {/* List Section */}
      <section>
        <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-sm font-medium text-gray-400">Recent Activity</h2>
            <button className="text-xs text-indigo-400 hover:text-indigo-300">View All</button>
        </div>

        <div className="space-y-3">
          {dates.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-gray-600 text-sm">No transactions yet</p>
            </div>
          ) : (
            dates.map((date) => (
              <div
                key={date}
                className="group bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] p-4 rounded-2xl flex justify-between items-center transition-all duration-300"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-300">
                    {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider">{new Date(date).toLocaleDateString('en-IN', { weekday: 'long' })}</span>
                </div>
                <span className="font-mono text-lg font-medium group-hover:text-indigo-400 transition-colors">
                  ₹{grouped[date]}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}