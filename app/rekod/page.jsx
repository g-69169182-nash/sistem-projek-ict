"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function RekodPenggunaan() {
  const router = useRouter();
  const supabase = createClient();

  const [kelas, setKelas] = useState("");
  const [namaList, setNamaList] = useState([]);
  const [nama, setNama] = useState("");
  const [purpose, setPurpose] = useState("");
  const [pc, setPc] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const senaraiKelas = [
    "1 Mawar", "2 Melor", "3 Orkid",
    "4 Kekwa", "5 Tulip", "6 Dahlia",
  ];

  const senaraiTujuan = [
    "DELIMA",
    "PDP",
    "Melayari Internet",
    "Permainan Interaktif",
    "Lain-lain",
  ];

  const senaraiPC = Array.from({ length: 20 }, (_, i) => `PC${i + 1}`);

  // Autofill Nama Mengikut Kelas
  useEffect(() => {
    const loadNames = async () => {
      if (!kelas) return;

      const { data, error } = await supabase
        .from("students")
        .select("name")
        .eq("class", kelas)
        .order("name");

      if (!error) setNamaList(data);
    };

    loadNames();
  }, [kelas, supabase]);

  // Simpan Rekod
  const handleSave = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("usages").insert({
      name: nama,
      class: kelas,
      purpose,
      pc_number: pc,
    });

    if (!error) {
      setSuccessMsg("✔ Berjaya disimpan!");
      setTimeout(() => setSuccessMsg(""), 2000);

      setNama("");
      setKelas("");
      setPurpose("");
      setPc("");
    }
  };

  return (
    <div className="min-h-screen bg-[#e8ecf7] text-black p-6">

      {/* Tajuk & Versi */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Rekod Penggunaan Makmal ICT</h1>
        <p className="text-gray-600 mt-1 text-lg">Versi 2026</p>
      </div>

      {/* Kotak Borang */}
      <div className="w-full max-w-xl mx-auto bg-[#0f1624] text-white p-6 rounded-xl shadow-xl">

        <form className="space-y-4" onSubmit={handleSave}>
          {/* Kelas */}
          <div>
            <label>Kelas</label>
            <select
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="w-full p-3 rounded bg-[#dbe4fd] text-black"
              required
            >
              <option value="">Pilih kelas</option>
              {senaraiKelas.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Nama Murid */}
          <div>
            <label>Nama Murid</label>
            <select
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full p-3 rounded bg-[#dbe4fd] text-black"
              required
            >
              <option value="">Pilih nama</option>

              {namaList.length > 0 &&
                namaList.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}

              {kelas && namaList.length === 0 && (
                <option disabled>Tiada nama tersedia</option>
              )}
            </select>
          </div>

          {/* Tujuan */}
          <div>
            <label>Tujuan</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-3 rounded bg-[#dbe4fd] text-black"
              required
            >
              <option value="">Pilih tujuan</option>
              {senaraiTujuan.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Nombor PC */}
          <div>
            <label>Nombor PC</label>
            <select
              value={pc}
              onChange={(e) => setPc(e.target.value)}
              className="w-full p-3 rounded bg-[#dbe4fd] text-black"
              required
            >
              <option value="">Pilih PC</option>
              {senaraiPC.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          {/* Mesej Berjaya */}
          {successMsg && (
            <p className="text-green-400 text-center font-semibold">
              {successMsg}
            </p>
          )}

          {/* Butang Simpan */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold"
          >
            Simpan Rekod
          </button>
        </form>
      </div>

      {/* 👇 Link Login Admin */}
      <div className="text-center mt-6">
        <button
          onClick={() => router.push("/admin")}
          className="text-blue-700 font-semibold hover:underline"
        >
          Login Admin
        </button>
      </div>
    </div>
  );
}
