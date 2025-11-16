import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function POST(req) {
  const supabase = createClient();

  const form = await req.formData();
  const file = form.get("file");
  const text = await file.text();

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const rows = lines.slice(1).map((l) => {
    const [name, className] = l.split(",");
    return { name, class: className };
  });

  // BACKUP step
  const { data: existing } = await supabase.from("students").select("*");
  if (existing?.length) {
    await supabase.from("backup_students").insert(existing);
  }

  // RESET
  await supabase.from("students").delete().neq("id", -1);

  // IMPORT NEW
  const { error } = await supabase.from("students").insert(rows);
  if (error) {
    return NextResponse.json({ error: error.message });
  }

  return NextResponse.json({ message: "Reset + Import selesai!" });
}
