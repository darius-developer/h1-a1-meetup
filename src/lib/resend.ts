import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export function buildConfirmationEmail(name: string) {
  return {
    subject: "Du bist dabei – H1-A1 AI Meetup",
    html: `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#2e2e2e;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;">
    <div style="background:#2e2e2e;padding:32px 40px;">
      <span style="font-size:20px;color:#f5f4f0;">
        <em style="font-family:Georgia,serif;">H1</em><strong>&ndash;A1</strong>
      </span>
    </div>
    <div style="padding:40px;">
      <h1 style="font-family:Georgia,serif;font-size:28px;margin:0 0 16px;color:#2e2e2e;">
        Say hi, schön dass du dabei bist! 👋
      </h1>
      <p style="font-size:16px;line-height:1.6;color:#2e2e2e;margin:0 0 24px;">
        Hi ${name},<br><br>
        du hast dich erfolgreich für das <strong>H1–A1 AI Meetup</strong> angemeldet.
      </p>
      <div style="background:#f5f4f0;border-radius:12px;padding:24px;margin:0 0 24px;">
        <p style="font-size:14px;font-weight:bold;color:#2e2e2e;margin:0 0 8px;">Was dich erwartet:</p>
        <p style="font-size:14px;line-height:1.6;color:#95929b;margin:0;">
          KI-Updates, ein Deep Dive, Speed-Networking und echte Gespräche – ca. 2 Stunden, locker und hands-on.
        </p>
      </div>
      <p style="font-size:14px;line-height:1.6;color:#95929b;margin:0;">
        Wir freuen uns auf dich.<br><br>
        <strong style="color:#fe663f;">H1–A1 AI Meetup</strong><br>
        Deine KI Community
      </p>
    </div>
    <div style="border-top:1px solid #f0efeb;padding:24px 40px;text-align:center;">
      <p style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:#95929b;margin:0;">
        Close the gap.
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}
