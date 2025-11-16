"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Emel atau kata laluan salah.");
      return;
    }

    router.push("/admin/dashboard");
  };

  const handleCancel = () => {
    router.push("/rekod"); // Kembali ke halaman rekod penggunaan
  };

  return (
    <div className="min-h-screen bg-[#e8ecf7] p-6 flex justify-center">
      <div className="w-full max-w-md bg-[#1d2433] shadow-xl p-8 rounded-xl">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Log Masuk Admin</h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-gray-300 block mb-1">Emel Admin</label>
            <input
              type="email"
              className="w-full p-3 rounded-lg bg-[#dbe4fd] text-black"
              placeholder="admin@sekolah.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-1">Kata Laluan</label>
            <input
              type="password"
              className="w-full p-3 rounded-lg bg-[#dbe4fd] text-black"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMsg && (
            <p className="text-red-400 text-center">{errorMsg}</p>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              className="w-full bg-blue-600 py-3 rounded-lg text-white font-semibold"
            >
              Log Masuk
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full bg-gray-600 py-3 rounded-lg text-white font-semibold"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
