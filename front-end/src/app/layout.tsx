import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PersiaMehr CRM",
  description: "CRM for PersiaMehr contacts, events, and messaging",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <body>{children}</body>
    </html>
  );
}
