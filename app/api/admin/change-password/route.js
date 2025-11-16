import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { oldPwd, newPwd } = await req.json();

    console.log("=== REQUEST DITERIMA ===");
    console.log("oldPwd (user masukkan):", oldPwd);
    console.log("newPwd:", newPwd);
    console.log("========================");

    // Ambil row pertama tanpa .single()
    const { data: rows, error: selectErr } = await supabase
      .from("settings")
      .select("*")
      .limit(1);

    if (selectErr) {
      console.log("ERROR ambil data settings:", selectErr);
      return Response.json(
        { error: "Gagal ambil data admin." },
        { status: 500 }
      );
    }

    if (!rows || rows.length === 0) {
      return Response.json(
        { error: "Tiada data admin dalam jadual settings." },
        { status: 404 }
      );
    }

    const settings = rows[0];

    // Semak password lama
    if (oldPwd !== settings.admin_password) {
      return Response.json(
        { error: "Password lama salah!" },
        { status: 400 }
      );
    }

    // Update
    const { error: updateErr } = await supabase
      .from("settings")
      .update({ admin_password: newPwd })
      .eq("id", settings.id);

    if (updateErr) {
      return Response.json(
        { error: "Gagal mengemaskini password." },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, message: "Password berjaya ditukar!" },
      { status: 200 }
    );

  } catch (err) {
    console.log("SERVER ERROR:", err);
    return Response.json(
      { error: "Ralat pada server." },
      { status: 500 }
    );
  }
}
