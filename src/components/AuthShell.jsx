import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

// 🔹 Shared layout for Login / Reset / Update password / 404 so they all match
export default function AuthShell({ backTo = "/profile", backLabel = "Back", icon, title, subtitle, children, footer }) {
  return (
    <div className="min-h-dvh px-5 pt-safe max-w-md mx-auto flex flex-col" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}>
      <div className="flex items-center justify-between">
        {backTo ? (
          <Link to={backTo} aria-label={backLabel} className="w-11 h-11 rounded-2xl bg-surface border border-line text-muted hover:text-fg flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft size={18} />
          </Link>
        ) : <span />}
        <p className="font-display text-lg font-bold">Expensio<span className="text-accent">.</span></p>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col justify-center py-8">
        <div className="text-center mb-7">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="absolute inset-0 rounded-[1.75rem] bg-accent-soft blur-xl" aria-hidden="true" />
            <div className="relative w-full h-full rounded-[1.75rem] bg-linear-to-br from-primary to-primary-2 p-[2px] shadow-card">
              <div className="w-full h-full rounded-[calc(1.75rem-2px)] bg-surface flex items-center justify-center text-accent">
                {icon}
              </div>
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-2 max-w-xs mx-auto">{subtitle}</p>}
        </div>

        {children}

        {footer && <div className="text-center text-sm text-muted mt-6">{footer}</div>}
      </div>
    </div>
  );
}
