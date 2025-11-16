import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";   // <-- BETUL

export async function POST() {
  const supabase = createClient();

  // 1️⃣ Dapatkan log terbaru
  const { data: logs, error: logErr } = await supabase
    .from("migrate_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (logErr) return NextResponse.json({ error: logErr.message }, { status: 500 });

  if (!logs || logs.length === 0) {
    return NextResponse.json({ message: "Tiada backup ditemui untuk Undo." });
  }

  const latest = logs[0];

  // 2️⃣ Ambil snapshot (JSONB auto-parse)
  const snapshot = latest.snapshot;

  if (!Array.isArray(snapshot) || snapshot.length === 0) {
    return NextResponse.json({ error: "Snapshot kosong." }, { status: 500 });
  }

  // 3️⃣ Padam semua data students
  const { error: delErr } = await supabase
    .from("students")
    .delete()
    .neq("id", "");

  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  // 4️⃣ Restore snapshot
  const { error: insertErr } = await supabase.from("students").insert(snapshot);

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // 5️⃣ Padam log supaya undo hanya sekali
  await supabase.from("migrate_log").delete().eq("id", latest.id);

  return NextResponse.json({
    message: "Undo Migrasi berjaya! Data murid dikembalikan ke kelas asal.",
    restored: snapshot.length,
  });
}