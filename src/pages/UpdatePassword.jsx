import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [validSession, setValidSession] = useState(null); // 🔥 important
  const navigate = useNavigate();

  // 🔥 Check if reset session exists
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setValidSession(false);
      } else {
        setValidSession(true);
      }
    };

    checkSession();
  }, []);

  const handleUpdate = async () => {
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      alert("Link expired. Please request again.");
      navigate("/");
    } else {
      alert("Password updated!");
      navigate("/");
    }
  };

  // 🔄 Loading state
  if (validSession === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Checking link...
      </div>
    );
  }

  // ❌ Expired / invalid link
  if (!validSession) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-[#0a0a0a] text-white">
        <h1 className="text-xl mb-3">Link Expired ❌</h1>
        <p className="text-gray-400 mb-6 text-sm">
          This reset link is invalid or already used.
        </p>

        <button
          onClick={() => navigate("/")}
          className="bg-white text-black px-6 py-2 rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  // ✅ Valid session UI (your original UI)
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-[#0a0a0a] text-white antialiased">
      <div className="w-full max-w-sm p-8 flex flex-col items-center bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-sm shadow-2xl">
        
        <h1 className="text-2xl font-semibold tracking-tight mb-6">
          Update Password
        </h1>

        <div className="w-full flex flex-col gap-4">
          <input
            type="password"
            placeholder="Enter new password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/30 outline-none transition-all placeholder:text-gray-500"
          />

          <button
            onClick={handleUpdate}
            className="w-full bg-white text-black font-semibold p-3.5 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-200"
          >
            Update Password
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500 uppercase tracking-widest">
          Secure Account Access
        </p>
      </div>
    </div>
  );
}
