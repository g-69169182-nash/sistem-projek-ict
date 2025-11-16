"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // New passwords matching?
    if (newPassword !== confirmNewPassword) {
      setErrorMsg("Kata laluan baru tidak sepadan.");
      return;
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg("Sesi tamat. Sila log masuk semula.");
      router.push("/admin");
      return;
    }

    // 1. Validate old password
    const { error: oldPassError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (oldPassError) {
      setErrorMsg("Kata laluan lama salah.");
      return;
    }

    // 2. Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setErrorMsg("Gagal kemaskini kata laluan.");
    } else {
      setSuccessMsg("Berjaya dikemaskini!!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-[#e8edff] flex items-center justify-center p-6">
      <div className="bg-[#0f1624] p-6 rounded-2xl shadow-xl w-full max-w-md">

        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Kemaskini Kata Laluan Admin
        </h1>

        <form onSubmit={handlePasswordChange} className="space-y-4">

          {/* Old Password */}
          <div>
            <label className="text-gray-300">Kata Laluan Lama</label>
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                className="w-full mt-1 p-3 rounded-lg bg-[#dbe4fd] text-black"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-4 text-gray-700"
                onClick={() => setShowOld(!showOld)}
              >
                {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-gray-300">Kata Laluan Baru</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                className="w-full mt-1 p-3 rounded-lg bg-[#dbe4fd] text-black"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-4 text-gray-700"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-gray-300">Pengesahan Kata Laluan Baru</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="w-full mt-1 p-3 rounded-lg bg-[#dbe4fd] text-black"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-4 text-gray-700"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && <p className="text-red-400">{errorMsg}</p>}

          {/* Success Message */}
          {successMsg && (
            <p className="text-green-400 font-semibold text-center">
              {successMsg}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
              Kemaskini
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard")}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg"
            >
              Batal
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
