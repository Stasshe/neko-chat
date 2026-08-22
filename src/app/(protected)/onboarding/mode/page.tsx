"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { MobileShell } from "@/components/mobile-shell";
import { ErrorState } from "@/components/status";
import { useApp } from "@/state/app-provider";

const modeCatSlots = ["first", "second", "third"] as const;

function ModeCats({ count, join = false }: { count: 1 | 3; join?: boolean }) {
  const classes = ["mode-cats", `mode-cats--${count}`];
  if (join) {
    classes.push("mode-cats--join");
  }
  return (
    <span className={classes.join(" ")} aria-hidden="true">
      {modeCatSlots.slice(0, count).map((slot) => (
        <Image src="/images/ui/icons/cat-outline.png" alt="" width={52} height={52} key={slot} />
      ))}
      {join && <span className="mode-cats__plus">+</span>}
    </span>
  );
}

export default function ModePage() {
  const router = useRouter();
  const { loading, error, startSolo } = useApp();

  async function chooseSolo() {
    try {
      await startSolo();
      router.replace("/onboarding/cat");
    } catch {
      /* provider state */
    }
  }

  return (
    <MobileShell>
      <BackLink href="/onboarding/profile" />
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
            <ModeCats count={1} />
          </button>
          <button type="button" onClick={() => router.replace("/onboarding/group")}>
            <strong>グループを作る</strong>
            <span>
              新しくグループを作って
              <br />
              みんなを招待しよう
            </span>
            <ModeCats count={3} />
          </button>
          <button type="button" onClick={() => router.replace("/onboarding/join")}>
            <strong>グループに参加する</strong>
            <span>
              招待コードを入力して
              <br />
              グループに参加しよう
            </span>
            <ModeCats count={1} join />
          </button>
        </div>
        {error && <ErrorState message={error} />}
      </section>
    </MobileShell>
  );
}
