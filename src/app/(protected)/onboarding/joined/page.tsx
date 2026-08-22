"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BackLink } from "@/components/back-link";
import { Button } from "@/components/button";
import { MobileShell } from "@/components/mobile-shell";

function JoinedContent() {
  const router = useRouter();
  const params = useSearchParams();
  const name = params.get("name") ?? "グループ";
  const returnToGroups = params.get("returnTo") === "groups";
  return (
    <MobileShell>
      <BackLink href="/groups" label="グループ一覧へ戻る" />
      <section className="invite-created joined">
        <span className="accent-lines" aria-hidden="true" />
        <h1>{name} に参加しました</h1>
        <Image
          className="paw-mark"
          src="/images/ui/icons/paw-print.png"
          alt=""
          width={198}
          height={198}
        />
        <Button onClick={() => router.replace(returnToGroups ? "/groups" : "/onboarding/cat")}>
          つぎへ
        </Button>
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
