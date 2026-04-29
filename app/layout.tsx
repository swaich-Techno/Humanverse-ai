import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HumanVerse AI Studio",
  description:
    "Create realistic AI characters, places, scenes, and short promo videos."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
