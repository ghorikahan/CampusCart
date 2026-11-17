import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { env } from "@/lib/env";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fontHeading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "CampusCart | Student Marketplace",
    template: "%s | CampusCart",
  },
  description:
    "Buy, sell, exchange, and donate textbooks, electronics, dorm furniture, and student gear safely on your campus.",
  keywords: [
    "student marketplace",
    "campus second hand",
    "buy textbooks",
    "sell college items",
    "dorm furniture exchange",
    "student discount marketplace",
  ],
  authors: [{ name: "CampusCart Community" }],
  creator: "CampusCart",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "CampusCart",
    title: "CampusCart | Student Marketplace",
    description:
      "Buy, sell, exchange, and donate textbooks, electronics, dorm essentials safely on campus.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusCart | Student Marketplace",
    description:
      "Buy, sell, exchange, and donate textbooks, electronics, dorm essentials safely on campus.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontHeading.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground pb-16 md:pb-0 overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1 flex flex-col min-w-0">{children}</main>
          <Footer />
          <MobileBottomNav />
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
