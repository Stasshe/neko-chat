export default function ProtectedHomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6 py-12 text-center">
        <div className="space-y-3">
          <p className="text-sm tracking-[0.2em] text-muted-foreground">AUTHENTICATED</p>
          <h1 className="text-3xl font-bold">保護されたホーム</h1>
          <p className="text-sm text-muted-foreground">未認証ユーザーはこの画面に入れない</p>
        </div>
      </div>
    </main>
  );
}
