// /app/api/migrate/route.js
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function POST() {
  const supabase = createClient();

  try {
    // ======================================================
    // 1. Backup semua students → migrate_log (UNDO FEATURE)
    // ======================================================
    const { data: allStudents } = await supabase
      .from("students")
      .select("*");

    await supabase
      .from("migrate_log")
      .insert([{ snapshot: allStudents }]);

    // ======================================================
    // 2. Mula migrasi (kod cikgu yang lama — kekalkan)
    // ======================================================

    const { data: sixData } = await supabase
      .from("students")
      .select("name, class, created_at")
      .eq("class", "6 Dahlia");

    const countArchived = sixData.length;

    if (countArchived > 0) {
      await supabase.from("arkib_students").insert(sixData);
      await supabase.from("students").delete().eq("class", "6 Dahlia");
    }

    // promote using TEMP naming
    const tempSteps = [
      { from: "5 Tulip", temp: "TEMP_6" },
      { from: "4 Kekwa", temp: "TEMP_5" },
      { from: "3 Orkid", temp: "TEMP_4" },
      { from: "2 Melor", temp: "TEMP_3" },
      { from: "1 Mawar", temp: "TEMP_2" },
    ];

    for (const step of tempSteps) {
      await supabase
        .from("students")
        .update({ class: step.temp })
        .eq("class", step.from);
    }

    const finalSteps = [
      { temp: "TEMP_6", to: "6 Dahlia" },
      { temp: "TEMP_5", to: "5 Tulip" },
      { temp: "TEMP_4", to: "4 Kekwa" },
      { temp: "TEMP_3", to: "3 Orkid" },
      { temp: "TEMP_2", to: "2 Melor" },
    ];

    for (const step of finalSteps) {
      await supabase
        .from("students")
        .update({ class: step.to })
        .eq("class", step.temp);
    }

    return NextResponse.json({
      message: "Migrasi selesai! Backup tersedia untuk Undo.",
    });

  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
