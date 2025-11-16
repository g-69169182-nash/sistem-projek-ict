import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function POST() {
  const supabase = createClient();

  // clear current students
  await supabase.from("students").delete().neq("id", -1);

  // restore backup to students
  const { data, error } = await supabase
    .from("backup_students")
    .select("*");

  if (error) return NextResponse.json({ error: error.message });

  const rows = data.map((r) => ({
    name: r.name,
    class: r.class,
  }));

  const { error: insertErr } = await supabase.from("students").insert(rows);

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Backup berjaya dipulihkan!" });
}
