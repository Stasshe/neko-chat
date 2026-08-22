"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BackLink } from "@/components/back-link";
import { Button } from "@/components/button";
import { MobileShell } from "@/components/mobile-shell";

function getCopyLabel(copied: boolean): string {
  if (copied) {
    return "コピーしました";
  }
  return "コードをコピー";
}

export function InviteCreatedContent({ code }: { code: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  async function copy() {
    if (!code) {
      setCopyError("コピーする招待コードがありません。");
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setCopyError(null);
    } catch (error) {
      console.error(error);
      setCopyError("コピーできませんでした。コードを長押ししてコピーしてください。");
    }
  }

  return (
    <MobileShell>
      <BackLink href="/groups" label="グループ一覧へ戻る" />
      <section className="invite-created">
        <span className="accent-lines" aria-hidden="true" />
        <h1>グループが作成されました</h1>
        <Image
          className="paw-mark"
          src="/images/ui/icons/paw-print.png"
          alt=""
          width={198}
          height={198}
        />
        <h2>招待コード</h2>
        <output>{code || "------"}</output>
        <button className="copy-button" type="button" onClick={() => void copy()} disabled={!code}>
          {getCopyLabel(copied)}
        </button>
        {copyError && <p className="form-error">{copyError}</p>}
        <Button onClick={() => router.push("/onboarding/cat")}>つぎへ</Button>
      </section>
    </MobileShell>
  );
}
