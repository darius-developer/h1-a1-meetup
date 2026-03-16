import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "H1-A1 AI Meetup – Close the gap.",
  description:
    "Offenes Community-Meetup rund um Künstliche Intelligenz in Kiel. Alle 6–8 Wochen. Kostenlos. Für alle.",
  openGraph: {
    title: "H1-A1 AI Meetup – Close the gap.",
    description:
      "Offenes Community-Meetup rund um KI in Kiel. Hands-on, niedrigschwellig, kostenlos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&display=swap"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
