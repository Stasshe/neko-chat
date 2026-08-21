"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { MobileShell } from "@/components/mobile-shell";
import { ErrorState } from "@/components/status";
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
      router.push(`/onboarding/invite?code=${result.inviteCode}`);
    } catch {
      /* provider state */
    }
  }
  return (
    <MobileShell>
      <section className="onboarding-form">
        <h1>グループを作成しよう</h1>
        <div className="onboarding-cats" aria-hidden="true">
          ◡　◡
          <br />
          　◡
        </div>
        <form onSubmit={submit}>
          <label className="sr-only" htmlFor="group-name">
            グループ名
          </label>
          <input
            id="group-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={30}
            placeholder="グループ名を入力してください"
          />
          {(validationError || error) && <ErrorState message={validationError ?? error ?? ""} />}
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "作成中" : "作成"}
          </button>
        </form>
      </section>
    </MobileShell>
  );
}
