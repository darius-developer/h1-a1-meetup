import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("registrations")
    .select("id, name, email, companion, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Daten konnten nicht geladen werden." },
      { status: 500 }
    );
  }

  const totalPersons =
    (data?.length || 0) + (data?.filter((r) => r.companion).length || 0);

  return NextResponse.json({
    registrations: data,
    count: data?.length || 0,
    totalPersons,
  });
}
