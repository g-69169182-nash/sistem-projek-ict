"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ChangeAccount() {
  const [newEmail, setNewEmail] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [msg, setMsg] = useState("");

  // Fungsi untuk log aktiviti admin
  const logActivity = async (admin_id, action) => {
    await supabase.from("admin_logs").insert([
      {
        admin_id,
        action,
      },
    ]);
  };

  const updateAccount = async () => {
    setMsg("");

    const confirm = window.confirm(
      "Adakah anda pasti mahu mengemaskini maklumat akaun admin?"
    );

    if (!confirm) return;

    // Dapatkan user semasa
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMsg("❌ Sesi tamat. Sila log masuk semula.");
      return;
    }

    // 1️⃣ Semak kata laluan lama dulu
    const { error: reAuthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPass,
    });

    if (reAuthError) {
      setMsg("❌ Kata laluan lama tidak tepat.");
      return;
    }

    let changes = [];

    // 2️⃣ Update emel jika diisi
    if (newEmail.trim() !== "") {
      const { error: emailErr } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (emailErr) {
        setMsg("❌ Tidak berjaya kemaskini emel: " + emailErr.message);
        return;
      }

      changes.push("Emel ditukar kepada: " + newEmail);
      await logActivity(user.id, `Admin menukar emel kepada ${newEmail}`);
    }

    // 3️⃣ Update password jika diisi
    if (newPass.trim() !== "") {
      const { error: passErr } = await supabase.auth.updateUser({
        password: newPass,
      });

      if (passErr) {
        setMsg("❌ Tidak berjaya kemaskini kata laluan.");
        return;
      }

      changes.push("Kata laluan ditukar");
      await logActivity(user.id, "Admin menukar kata laluan");
    }

    if (changes.length === 0) {
      setMsg("⚠ Tiada perubahan dibuat.");
      return;
    }

    setMsg("✔ Berjaya kemaskini akaun admin!");
  };

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-bold mb-6">Kemaskini Akaun Admin</h1>

      {/* Tukar Emel */}
      <label className="block text-2xl mb-2">Emel Baharu (Opsyen)</label>
      <input
        type="email"
        className="w-full p-4 mb-6 bg-gray-800 rounded-xl text-xl"
        placeholder="Masukkan emel baharu"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
      />

      {/* Kata Laluan Lama */}
      <label className="block text-2xl mb-2">Kata Laluan Lama</label>
      <div className="relative mb-6">
        <input
          type={showOldPass ? "text" : "password"}
          className="w-full p-4 bg-gray-800 rounded-xl text-xl"
          placeholder="Masukkan kata laluan lama"
          value={oldPass}
          onChange={(e) => setOldPass(e.target.value)}
        />
        <span
          className="absolute right-4 top-4 text-2xl cursor-pointer"
          onClick={() => setShowOldPass(!showOldPass)}
        >
          {showOldPass ? "👁‍🗨" : "👁"}
        </span>
      </div>

      {/* Kata Laluan Baharu */}
      <label className="block text-2xl mb-2">Kata Laluan Baharu (Opsyen)</label>
      <div className="relative mb-6">
        <input
          type={showNewPass ? "text" : "password"}
          className="w-full p-4 bg-gray-800 rounded-xl text-xl"
          placeholder="Masukkan kata laluan baharu"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />
        <span
          className="absolute right-4 top-4 text-2xl cursor-pointer"
          onClick={() => setShowNewPass(!showNewPass)}
        >
          {showNewPass ? "👁‍🗨" : "👁"}
        </span>
      </div>

      {/* Papar mesej */}
      {msg && <p className="mt-4 text-xl font-semibold mb-6">{msg}</p>}

      {/* Butang */}
      <div className="flex gap-4">
        <button
          onClick={updateAccount}
          className="bg-blue-600 px-8 py-4 text-2xl rounded-xl font-bold hover:bg-blue-700"
        >
          Kemaskini
        </button>

        <button
          onClick={() => (window.location.href = "/admin/dashboard")}
          className="bg-gray-500 px-8 py-4 text-2xl rounded-xl font-bold hover:bg-gray-600"
        >
          Batal
        </button>
      </div>
    </main>
  );
}
