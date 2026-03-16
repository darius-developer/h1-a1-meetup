import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getResend, buildConfirmationEmail } from "@/lib/resend";

// Simple in-memory rate limiting per IP
const rateMap = new Map<string, number[]>();
const RATE_WINDOW = 60_000; // 1 minute
const RATE_LIMIT = 5; // max 5 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateMap.get(ip) || []).filter((t) => now - t < RATE_WINDOW);
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  rateMap.set(ip, timestamps);
  return false;
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuche es gleich erneut." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { name, email, companion, website, _t } = body;

  // Honeypot: if "website" field is filled, it's a bot
  if (website) {
    // Pretend success so bots don't retry
    return NextResponse.json({ success: true, data: [] });
  }

  // Time-based check: form must take at least 3 seconds to fill
  if (_t && Date.now() - _t < 3000) {
    return NextResponse.json({ success: true, data: [] });
  }

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
  const resend = getResend();
  if (resend) {
    try {
      const { subject, html } = buildConfirmationEmail(name.trim());
      await resend.emails.send({
        from: "H1-A1 AI Meetup <meetup@fairplay.management>",
        to: trimmedEmail,
        subject,
        html,
      });
    } catch (emailError) {
      console.error("Resend email error:", emailError);
    }
  }

  return NextResponse.json({ success: true, data });
}
