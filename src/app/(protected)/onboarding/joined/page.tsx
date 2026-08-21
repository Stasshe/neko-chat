"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/button";
import { MobileShell } from "@/components/mobile-shell";

function JoinedContent() {
  const router = useRouter();
  const params = useSearchParams();
  const name = params.get("name") ?? "グループ";
  return (
    <MobileShell>
      <section className="invite-created joined">
        <h1>{name} に参加しました</h1>
        <div className="paw-mark" aria-hidden="true">
          ●
        </div>
        <Button onClick={() => router.push("/onboarding/cat")}>つぎへ</Button>
      </section>
    </MobileShell>
  );
}

export default function JoinedPage() {
  return (
    <Suspense fallback={null}>
      <JoinedContent />
    </Suspense>
  );
}
