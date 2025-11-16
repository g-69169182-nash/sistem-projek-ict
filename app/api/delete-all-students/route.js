import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function POST() {
  try {
    const supabase = createClient();

    // Padam semua & return rows yang dipadam
    const { data, error } = await supabase
      .from("students")
      .delete()
      .gt("id", "00000000-0000-0000-0000-000000000000")
      .select("*"); // <-- WAJIB supaya data bukan null

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      deleted: data.length,
      message: `Berjaya padam ${data.length} rekod.`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
