import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tales of Gutsy Ninja",
  description: "A persistent shinobi RPG world",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased min-h-screen`}
      >
        {/* Global navigation (Home / Dashboard button lives here) */}
        <Navbar />

        {/* Page content */}
        <main className="pt-14">
          {children}
        </main>
      </body>
    </html>
  );
}