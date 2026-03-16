import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { resend, buildConfirmationEmail } from "@/lib/resend";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, companion } = body;

  if (!name || !email || companion === undefined) {
    return NextResponse.json(
      { error: "Alle Pflichtfelder müssen ausgefüllt sein." },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Bitte gib eine gültige E-Mail-Adresse ein." },
      { status: 400 }
    );
  }

  const trimmedEmail = email.toLowerCase().trim();

  // Check for duplicate email
  const { data: existing } = await supabase
    .from("registrations")
    .select("id")
    .eq("email", trimmedEmail)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Diese E-Mail-Adresse ist bereits angemeldet." },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("registrations")
    .insert([
      {
        name: name.trim(),
        email: trimmedEmail,
        companion: companion === "yes",
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json(
      { error: "Anmeldung fehlgeschlagen. Bitte versuche es erneut." },
      { status: 500 }
    );
  }

  // Send confirmation email via Resend
  try {
    const { subject, html } = buildConfirmationEmail(name.trim());
    await resend.emails.send({
      from: "H1-A1 AI Meetup <meetup@h1-a1.de>",
      to: trimmedEmail,
      subject,
      html,
    });
  } catch (emailError) {
    // Don't fail the registration if email fails
    console.error("Resend email error:", emailError);
  }

  return NextResponse.json({ success: true, data });
}
