import type { Metadata } from "next";

import { AuthProvider } from "@/lib/auth/auth-provider";

import "./globals.css";
import "./status.css";

export const metadata: Metadata = {
  title: "猫チャット",
  description: "猫モチーフのグループチャットアプリ",
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
