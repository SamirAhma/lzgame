import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ColorProvider from "@/components/ColorProvider";
import SettingsPanel from "@/components/SettingsPanel";
import Navbar from "@/components/Navbar";
import Providers from "./providers";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dichoptic Training Platform",
  description: "Vision therapy games for amblyopia treatment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <AuthProvider>
            <ColorProvider>
              <Navbar />
              <SettingsPanel />
              {children}
            </ColorProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

