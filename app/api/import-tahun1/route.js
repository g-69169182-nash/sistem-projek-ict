import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function POST(req) {
  const supabase = createClient();

  const formData = await req.formData();
  const file = formData.get("file");

  const text = await file.text();
  const rows = text.split("\n").map((v) => v.trim()).filter(Boolean);

  const students = rows.slice(1).map((name) => ({
    name,
    class: "1 Mawar",
  }));

  const { error } = await supabase.from("students").insert(students);

  if (error) return NextResponse.json({ error: error.message });

  return NextResponse.json({ message: "Import Tahun 1 selesai!" });
}
