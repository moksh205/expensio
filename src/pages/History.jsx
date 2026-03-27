export default function History({ expenses }) {
  // Group by date
  const grouped = expenses.reduce((acc, exp) => {
    if (!acc[exp.date]) acc[exp.date] = [];
    acc[exp.date].push(exp);
    return acc;
  }, {});

  const dates = Object.keys(grouped).reverse();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">History</h1>

      {dates.length === 0 && (
        <p className="text-gray-400 mt-6">No expenses yet</p>
      )}

      {dates.map((date) => (
        <div key={date} className="mt-6">
          <h2 className="text-gray-400 text-sm">{date}</h2>

          <div className="mt-2 space-y-2">
            {grouped[date].map((exp, i) => (
              <div
                key={i}
                className="bg-white/10 p-4 rounded-xl flex justify-between"
              >
                <div>
                  <p className="font-medium">{exp.note || exp.category}</p>
                  <p className="text-xs text-gray-400">{exp.category}</p>
                </div>

                <span className="font-semibold">₹{exp.amount}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}