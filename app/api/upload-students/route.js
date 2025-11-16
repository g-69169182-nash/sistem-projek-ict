import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function POST(req) {
  try {
    const supabase = createClient();

    // ---- 1. TERIMA FAIL CSV ----
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "Tiada fail diterima" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.trim().split("\n");

    let inserted = 0;

    for (let i = 0; i < lines.length; i++) {
      let row = lines[i].trim();
      if (!row) continue;

      // Buang header jika ada
      if (i === 0 && row.toLowerCase().includes("name")) continue;

      const parts = row.split(",");
      if (parts.length < 2) continue;

      const name = parts[0].trim();
      const className = parts[1].trim();

      if (!name || !className) continue;

      // --- 2. MASUKKAN DATA TANPA ID ---
      const { error } = await supabase.from("students").insert({
        name,
        class: className,
      });

      if (!error) inserted++;
      else console.error("Insert error:", error);
    }

    return NextResponse.json({ inserted });

  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
