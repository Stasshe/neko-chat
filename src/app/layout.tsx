import type { Metadata, Viewport } from "next";

import { AuthProvider } from "@/lib/auth/auth-provider";

import "./globals.css";
import "./status.css";

export const metadata: Metadata = {
  title: "猫チャット",
  description: "猫モチーフのグループチャットアプリ",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "猫チャット",
  },
  icons: {
    icon: "/icons/app-192.png",
    apple: "/icons/app-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#e0b369",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
