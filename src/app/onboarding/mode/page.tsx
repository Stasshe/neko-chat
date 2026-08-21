"use client";

import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/mobile-shell";
import { ErrorState } from "@/components/status";
import { useApp } from "@/state/app-provider";

export default function ModePage() {
  const router = useRouter();
  const { loading, error, startSolo } = useApp();

  async function chooseSolo() {
    try {
      await startSolo();
      router.push("/onboarding/cat");
    } catch {
      /* provider state */
    }
  }

  return (
    <MobileShell>
      <section className="mode-selection">
        <h1>どのようにはじめる？</h1>
        <div className="mode-list">
          <button type="button" onClick={() => void chooseSolo()} disabled={loading}>
            <strong>一人で始める</strong>
            <span>
              気ままに、一人で
              <br />
              楽しもう
            </span>
            <b>◡</b>
          </button>
          <button type="button" onClick={() => router.push("/onboarding/group")}>
            <strong>グループを作る</strong>
            <span>
              新しくグループを作って
              <br />
              みんなを招待しよう
            </span>
            <b>◡ ◡ ◡</b>
          </button>
          <button type="button" onClick={() => router.push("/onboarding/join")}>
            <strong>グループに参加する</strong>
            <span>
              招待コードを入力して
              <br />
              グループに参加しよう
            </span>
            <b>◡ ◡ ＋</b>
          </button>
        </div>
        {error && <ErrorState message={error} />}
      </section>
    </MobileShell>
  );
}
