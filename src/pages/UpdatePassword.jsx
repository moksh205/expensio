import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 🔥 IMPORTANT: capture session from URL
  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!data.session) {
        console.log("No session found");
      }
    };

    getSession();
  }, []);

  const handleUpdate = async () => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated!");
      navigate("/");
    }
  };

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