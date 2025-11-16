// app/admin/dashboard/page.jsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Settings, LogOut, UserCog } from "lucide-react";

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();

  // states
  const [adminEmail, setAdminEmail] = useState("");
  const [usages, setUsages] = useState([]);
  const [dailyCount, setDailyCount] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeRange, setActiveRange] = useState(null);

  const [classStats, setClassStats] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classUserSummary, setClassUserSummary] = useState([]);

  const [uploadMsg, setUploadMsg] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");
  const fileInputRef = useRef(null);

  const KELAS_LIST = [
    "1 Mawar",
    "2 Melor",
    "3 Orkid",
    "4 Kekwa",
    "5 Tulip",
    "6 Dahlia",
  ];

  useEffect(() => {
    loadUsageData();
    loadAdmin();
  }, []);

  const loadAdmin = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/admin");
        return;
      }
      // optional: you used profiles in earlier code
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/admin");
        return;
      }
      setAdminEmail(data.user.email);
    } catch (err) {
      console.error("loadAdmin:", err);
      router.push("/admin");
    }
  };

  const loadUsageData = async () => {
    try {
      const { data } = await supabase
        .from("usages")
        .select("*")
        .order("created_at", { ascending: false });

      if (!data) return;
      setUsages(data);
      computeOverallCounts(data);
    } catch (err) {
      console.error("loadUsageData:", err);
    }
  };

  // compute counts
  const computeOverallCounts = (data) => {
    const now = new Date();
    const daily = data.filter((u) => new Date(u.created_at).toDateString() === now.toDateString()).length;

    const sevenAgo = new Date();
    sevenAgo.setDate(now.getDate() - 7);
    const weekly = data.filter((u) => new Date(u.created_at) >= sevenAgo && new Date(u.created_at) <= new Date()).length;

    const monthly = data.filter((u) => {
      const d = new Date(u.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    setDailyCount(daily);
    setWeeklyCount(weekly);
    setMonthlyCount(monthly);
  };

  const isInRange = (createdAt, range) => {
    const d = new Date(createdAt);
    const now = new Date();
    if (range === "daily") return d.toDateString() === now.toDateString();
    if (range === "weekly") {
      const sevenAgo = new Date();
      sevenAgo.setDate(now.getDate() - 7);
      return d >= sevenAgo && d <= now;
    }
    if (range === "monthly") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return false;
  };

  // when click Harian/Mingguan/Bulanan
  const handleRangeClick = (range) => {
    const newRange = activeRange === range ? null : range;
    setActiveRange(newRange);
    setSelectedClass(null);
    setClassUserSummary([]);
    if (newRange) generateClassStatsForRange(newRange);
    else setClassStats([]);
  };

  const generateClassStatsForRange = (range) => {
    const stats = KELAS_LIST.map((kelas) => ({
      kelas,
      count: usages.filter((u) => u.class === kelas && isInRange(u.created_at, range)).length,
    }));
    setClassStats(stats);
  };

  // when click class card
  const handleClassClick = (kelas) => {
    setSelectedClass(kelas);
    const filtered = usages.filter((u) => u.class === kelas && isInRange(u.created_at, activeRange));
    const grouped = {};
    filtered.forEach((r) => {
      const key = r.name || "(Tiada nama)";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });

    const summary = Object.keys(grouped).map((name) => {
      const records = grouped[name];
      const lastUsed = records.reduce((a, b) => (new Date(a.created_at) > new Date(b.created_at) ? a : b)).created_at;
      return { name, count: records.length, lastUsed };
    });

    summary.sort((a, b) => b.count - a.count);
    setClassUserSummary(summary);
  };

  const getClassColor = (kelas) => {
    const colors = {
      "1 Mawar": { border: "border-pink-400", text: "text-pink-600" },
      "2 Melor": { border: "border-orange-400", text: "text-orange-600" },
      "3 Orkid": { border: "border-purple-400", text: "text-purple-600" },
      "4 Kekwa": { border: "border-yellow-400", text: "text-yellow-600" },
      "5 Tulip": { border: "border-red-400", text: "text-red-600" },
      "6 Dahlia": { border: "border-blue-400", text: "text-blue-600" },
    };
    return colors[kelas] || { border: "border-gray-300", text: "text-gray-600" };
  };

  // Export monthly CSV (rekod penggunaan bulanan sahaja)
  const exportMonthlyCSV = () => {
    const now = new Date();
    const monthlyData = usages.filter((u) => {
      const d = new Date(u.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    if (monthlyData.length === 0) {
      alert("Tiada rekod bulanan untuk dieksport.");
      return;
    }

    const header = ["Nama", "Kelas", "Tujuan", "PC", "Tarikh"];
    const rows = monthlyData.map((u) => [
      u.name || "",
      u.class || "",
      u.purpose || "",
      u.pc_number || "",
      new Date(u.created_at).toLocaleString("ms-MY"),
    ]);

    const csv = "data:text/csv;charset=utf-8," + [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const uri = encodeURI(csv);
    const link = document.createElement("a");
    link.href = uri;
    link.download = "rekod_penggunaan_bulanan.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // --------- NEW: Padam Semua Data Murid (without backup) ----------
  const handleDeleteAll = async () => {
    const ok = confirm("Padam semua data murid dari table students (TIADA BACKUP). Teruskan?");
    if (!ok) return;

    try {
      const res = await fetch("/api/delete-all-students", { method: "POST" });
      const json = await res.json();
      if (json.error) {
        setDeleteMsg("Ralat: " + (json.error || "Gagal padam"));
      } else {
        setDeleteMsg(`Data berjaya dipadam : ${json.deleted || 0}`);
      }
      // reload usages or students if needed
      await loadUsageData();
      setTimeout(() => setDeleteMsg(""), 5000);
    } catch (err) {
      console.error(err);
      setDeleteMsg("Ralat semasa padam data");
      setTimeout(() => setDeleteMsg(""), 5000);
    }
  };

  // --------- NEW: Upload CSV (name,class) ----------
  const handleUploadCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMsg("Memuat naik...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-students", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.error) {
        setUploadMsg("Ralat: " + json.error);
      } else {
        setUploadMsg(`Data berjaya dimuatnaik : ${json.inserted || 0}`);
      }
      // reload usages or students if needed
      await loadUsageData();
    } catch (err) {
      console.error(err);
      setUploadMsg("Ralat semasa upload");
    }
    setTimeout(() => setUploadMsg(""), 5000);
    // clear input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-[#e9eefb] p-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-[#0f1c3f]">Dashboard Admin</h1>

        {/* GEAR MENU */}
        <div className="relative">
          <button
            className="p-3 bg-white rounded-full shadow hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Settings size={26} className="text-gray-800" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-2">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-gray-800"
                onClick={() => router.push("/admin/update")}
              >
                <UserCog size={18} /> Kemaskini Akaun
              </button>

              <button
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-100 rounded-md text-red-600"
                onClick={handleLogout}
              >
                <LogOut size={18} /> Keluar
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-lg text-gray-700 mb-6">Selamat datang, <span className="font-bold">{adminEmail}</span></p>

      {/* SMALLER STAT KAD (HARI, MINGGU, BULAN) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => handleRangeClick("daily")}
          className={`transition rounded-xl p-4 shadow text-center ${activeRange === "daily" ? "ring-2 ring-blue-400" : "hover:shadow-lg"} bg-white`}
        >
          <h2 className="text-lg font-semibold text-gray-700">Harian</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">{dailyCount}</p>
        </button>

        <button
          onClick={() => handleRangeClick("weekly")}
          className={`transition rounded-xl p-4 shadow text-center ${activeRange === "weekly" ? "ring-2 ring-green-400" : "hover:shadow-lg"} bg-white`}
        >
          <h2 className="text-lg font-semibold text-gray-700">Mingguan</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">{weeklyCount}</p>
        </button>

        <button
          onClick={() => handleRangeClick("monthly")}
          className={`transition rounded-xl p-4 shadow text-center ${activeRange === "monthly" ? "ring-2 ring-orange-400" : "hover:shadow-lg"} bg-white`}
        >
          <h2 className="text-lg font-semibold text-gray-700">Bulanan</h2>
          <p className="text-3xl font-bold text-orange-600 mt-2">{monthlyCount}</p>
        </button>
      </div>

      {/* CLASS STATS */}
      {activeRange && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Statistik Mengikut Kelas ({activeRange})</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {classStats.map((c) => {
              const clr = getClassColor(c.kelas);
              return (
                <button
                  key={c.kelas}
                  onClick={() => handleClassClick(c.kelas)}
                  className={`cursor-pointer bg-white p-4 border-2 rounded-lg shadow text-center hover:bg-gray-50 transition ${clr.border}`}
                >
                  <h3 className="text-lg font-bold text-gray-800">{c.kelas}</h3>
                  <p className={`text-3xl font-bold mt-2 ${clr.text}`}>{c.count}</p>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* USER SUMMARY */}
      {selectedClass && (
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-300 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Senarai Pengguna — {selectedClass} ({activeRange})</h3>

          {classUserSummary.length === 0 ? (
            <p className="text-gray-600">Tiada rekod bagi kelas ini dalam julat.</p>
          ) : (
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-200 text-gray-800 text-sm">
                <tr>
                  <th className="p-2 text-left">Nama</th>
                  <th className="p-2 text-left">Tarikh Terakhir</th>
                  <th className="p-2 text-center">Jumlah Penggunaan</th>
                </tr>
              </thead>

              <tbody>
                {classUserSummary.map((s) => (
                  <tr key={s.name} className="border-t border-gray-300 hover:bg-gray-100 transition">
                    <td className="p-2 font-medium text-gray-900">{s.name}</td>
                    <td className="p-2 text-gray-700">{new Date(s.lastUsed).toLocaleString("ms-MY")}</td>
                    <td className="p-2 font-bold text-gray-900 text-center">{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ADMIN TOOLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Migrate */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h4 className="font-bold text-gray-800 mb-2">Migrasi Pelajar (Naik Kelas)</h4>
          <p className="text-sm text-gray-600 mb-3">Arkibkan 6 Dahlia → naikkan kelas lain</p>
          <button onClick={async () => {
            const ok = confirm("Proses migrasi akan arkibkan 6 Dahlia dan naikkan kelas lain. Teruskan?");
            if (!ok) return;
            try {
              const res = await fetch("/api/migrate", { method: "POST" });
              const json = await res.json();
              alert(json.message || ("Migrasi selesai. Dipindah: " + (json.count || 0)));
              await loadUsageData();
            } catch (err) { console.error(err); alert("Ralat migrasi"); }
          }} className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Naikkan Semua Murid</button>
        </div>

        {/* Padam Semua */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h4 className="font-bold text-gray-800 mb-2">Padam Semua Data Murid</h4>
          <p className="text-sm text-red-600 mb-3">Buang semua data murid tanpa backup. Berhati-hati.</p>
          <button onClick={handleDeleteAll} className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">Padam Semua</button>
          {deleteMsg && <p className="text-gray-800 font-semibold mt-3">{deleteMsg}</p>}
        </div>

        {/* Upload CSV */}
        <div className="bg-white p-4 rounded-lg shadow border md:col-span-2">
          <h4 className="font-bold text-gray-800 mb-2">Upload Data Murid (CSV)</h4>
          <p className="text-sm text-gray-600 mb-3">Format CSV: <code>name,class</code> (header optional)</p>
          <div className="flex items-center gap-3">
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleUploadCSV} className="border p-2 bg-gray-100 rounded" />
            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Upload CSV</button>
          </div>
          {uploadMsg && <p className="text-green-600 font-semibold mt-3">{uploadMsg}</p>}
        </div>
      </div>

      {/* REKOD PENGGUNAAN */}
      <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-300 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Rekod Penggunaan</h2>
          <div className="flex gap-2">
            <button onClick={exportMonthlyCSV} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow">Export Rekod Bulanan (CSV)</button>
          </div>
        </div>

        {usages.length === 0 ? (
          <p className="text-gray-700">Tiada rekod penggunaan setakat ini.</p>
        ) : (
          <table className="w-full rounded-lg border border-green-500">
            <thead>
              <tr className="bg-blue-100 text-gray-900 font-bold text-lg">
                <th className="border border-green-500 p-3 text-left">Nama</th>
                <th className="border border-green-500 p-3 text-left">Kelas</th>
                <th className="border border-green-500 p-3 text-left">Tujuan</th>
                <th className="border border-green-500 p-3 text-left">PC</th>
                <th className="border border-green-500 p-3 text-left">Tarikh</th>
              </tr>
            </thead>

            <tbody>
              {usages.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50">
                  <td className="border border-green-500 p-3 text-gray-900">{u.name}</td>
                  <td className="border border-green-500 p-3 text-gray-900">{u.class}</td>
                  <td className="border border-green-500 p-3 text-gray-900">{u.purpose}</td>
                  <td className="border border-green-500 p-3 text-gray-900">{u.pc_number}</td>
                  <td className="border border-green-500 p-3 text-gray-900">{new Date(u.created_at).toLocaleString("ms-MY")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}


