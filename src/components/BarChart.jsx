import { useState, useRef } from "react";
import { motion } from "framer-motion";

// 🔹 Single-series bar chart (dataviz rules: one color, 4px rounded data-end
// anchored to the baseline, 2px gaps, tooltip on hover/tap/arrow keys,
// hidden data table for screen readers).
// data: [{ key, label, value, tip }]  — `label` shows under the bar if `showLabel(i)`.
export default function BarChart({
  data,
  title,
  height = 96,
  highlightKey,
  format = (v) => v,
  showLabel = () => true,
}) {
  const [active, setActive] = useState(null);
  const ref = useRef(null);
  const max = Math.max(...data.map((d) => d.value), 1);

  // Whole chart is the hit target — pick the bar under the pointer
  const pick = (clientX) => {
    const r = ref.current.getBoundingClientRect();
    const i = Math.floor(((clientX - r.left) / r.width) * data.length);
    setActive(Math.min(data.length - 1, Math.max(0, i)));
  };

  const onKey = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); setActive((a) => Math.min(data.length - 1, (a ?? -1) + 1)); }
    if (e.key === "ArrowLeft") { e.preventDefault(); setActive((a) => Math.max(0, (a ?? data.length) - 1)); }
    if (e.key === "Escape") setActive(null);
  };

  const shown = active !== null ? data[active] : null;
  const tipLeft = active !== null ? ((active + 0.5) / data.length) * 100 : 0;

  return (
    <div className="relative">
      {/* Tooltip */}
      <div className="h-7 relative" aria-live="polite">
        {shown && (
          <div
            className="absolute -translate-x-1/2 whitespace-nowrap rounded-full bg-fg text-bg text-xs font-semibold px-2.5 py-1 shadow-card"
            style={{ left: `clamp(3rem, ${tipLeft}%, calc(100% - 3rem))` }}
          >
            {shown.tip || shown.label} · {format(shown.value)}
          </div>
        )}
      </div>

      <div
        ref={ref}
        role="group"
        tabIndex={0}
        aria-label={`${title}. Use left and right arrow keys to read each bar.`}
        onPointerMove={(e) => e.pointerType === "mouse" && pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
        className="flex items-end touch-pan-y rounded-lg"
        style={{ height, gap: data.length > 14 ? 2 : 6 }}
      >
        {data.map((d, i) => {
          const isOn = active === i || (active === null && d.key === highlightKey);
          const h = d.value > 0 ? Math.max((d.value / max) * height, 4) : 2;
          return (
            <div key={d.key} className="flex-1 h-full flex items-end">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: h }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.015, 0.3), ease: "easeOut" }}
                className={`w-full rounded-t-[4px] transition-colors ${
                  d.value === 0 ? "bg-surface-2" : isOn ? "bg-chart" : "bg-chart-dim"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Baseline labels (selective, never on every bar of a dense chart) */}
      <div className="flex mt-1.5" style={{ gap: data.length > 14 ? 2 : 6 }} aria-hidden="true">
        {data.map((d, i) => (
          <span key={d.key} className={`flex-1 text-center text-xs tabular-nums ${d.key === highlightKey ? "text-fg font-semibold" : "text-muted"}`}>
            {showLabel(i) ? d.label : ""}
          </span>
        ))}
      </div>

      {/* Table view for screen readers */}
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}><th scope="row">{d.tip || d.label}</th><td>{format(d.value)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
