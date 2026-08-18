"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
        <div className="space-y-4">
          <p className="text-sm tracking-[0.2em] text-muted-foreground">NEKO CHAT</p>
          <h1 className="text-4xl font-bold">猫チャット</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            ゆるく近況を共有する、猫モチーフのグループチャットアプリ
          </p>
        </div>

        <div className="mt-10 w-full space-y-3">
          <button
            type="button"
            className="w-full rounded-xl bg-primary px-5 py-3 text-primary-foreground"
          >
            Googleでログイン
          </button>
          <p className="text-xs text-muted-foreground">認証導線はこのあと FE-A で接続する</p>
        </div>
      </div>
    </main>
  );
}
