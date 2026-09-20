import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "split the bill",
  description: "collect your itemized debts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
