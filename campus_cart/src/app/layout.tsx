import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusCart | Student Marketplace",
  description: "Campus-focused second-hand marketplace to buy, sell, exchange, and donate items.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
