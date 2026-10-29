import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import SEO from "../components/SEO";
import AuthShell from "../components/AuthShell";

// 🔹 Shown for any unknown URL (used to be a blank page)
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <>
      <SEO title="Page not found - Expensio" description="This page doesn't exist." />
      <AuthShell
        backTo="/"
        backLabel="Back to home"
        icon={<Compass size={30} />}
        title="Page not found"
        subtitle="This link doesn't go anywhere. Let's get you back to your money."
      >
        <p className="text-center font-display text-7xl font-extrabold tracking-tight text-gradient mb-6" aria-hidden="true">404</p>
        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-linear-to-br from-primary to-primary-2 text-on-primary min-h-14 rounded-full font-semibold active:scale-[0.98] transition-transform shadow-card"
          >
            Go to dashboard
          </button>
          <button onClick={() => navigate("/add")} className="w-full min-h-12 rounded-full bg-surface-2 font-semibold text-sm">
            Add an expense
          </button>
        </div>
      </AuthShell>
    </>
  );
}
