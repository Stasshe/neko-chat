import type { Metadata } from "next";

import { AuthProvider } from "@/lib/auth/auth-provider";

import "./globals.css";
import "./status.css";
import { AppProvider } from "@/state/app-provider";

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
<body
  className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
>
  <AuthProvider>
    <AppProvider>{children}</AppProvider>
  </AuthProvider>
</body>
      </body>
    </html>
  );
}
