"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/button";
import { CatDisplay } from "@/components/cat-display";
import { MobileShell } from "@/components/mobile-shell";
import { ErrorState } from "@/components/status";
import { TextField } from "@/components/text-field";
import { useApp } from "@/state/app-provider";

export default function GroupPage() {
  const router = useRouter();
  const { createGroup, loading, error } = useApp();
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = name.trim();
    if (!value || value.length > 30) {
      setValidationError("グループ名は1〜30文字で入力してください。");
      return;
    }
    setValidationError(null);
    try {
      const result = await createGroup(value);
      router.replace(`/onboarding/invite?code=${result.inviteCode}`);
    } catch {
      /* provider state */
    }
  }
  return (
    <MobileShell>
      <section className="onboarding-form onboarding-form--group">
        <h1>グループを作成しよう</h1>
        <div className="onboarding-cat-group" aria-hidden="true">
          <CatDisplay type="black" emotion="negative" priority />
          <CatDisplay type="mike" emotion="negative" />
          <CatDisplay type="white" emotion="negative" />
        </div>
        <form onSubmit={submit}>
          <TextField
            id="group-name"
            label="グループ名"
            hideLabel
            value={name}
            onChange={setName}
            maxLength={30}
            placeholder="グループ名を入力してください"
          />
          {(validationError || error) && <ErrorState message={validationError ?? error ?? ""} />}
          <Button type="submit" disabled={loading}>
            {loading ? "作成中" : "作成"}
          </Button>
        </form>
      </section>
    </MobileShell>
  );
}
