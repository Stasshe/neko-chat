import type { Metadata } from "next";

import "./globals.css";
import { AppProvider } from "@/state/app-provider";

export const metadata: Metadata = {
  title: "猫チャット",
  description: "猫の表情と一言で、ゆるく近況を共有するグループアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
