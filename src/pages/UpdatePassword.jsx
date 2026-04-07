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
    <div className="h-screen flex flex-col justify-center items-center bg-black text-white">
      <h1 className="text-xl mb-4">Update Password</h1>

      <input
        type="password"
        placeholder="New password"
        onChange={(e) => setPassword(e.target.value)}
        className="p-3 rounded bg-white/10 mb-4"
      />

      <button
        onClick={handleUpdate}
        className="bg-white text-black px-6 py-2 rounded"
      >
        Update Password
      </button>
    </div>
  );
}