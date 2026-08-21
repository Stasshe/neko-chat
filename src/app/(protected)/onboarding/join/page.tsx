"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { MobileShell } from "@/components/mobile-shell";
import { ErrorState } from "@/components/status";
import { useApp } from "@/state/app-provider";

export default function JoinPage() {
  const router = useRouter();
  const { joinGroup, loading, error } = useApp();
  const [code, setCode] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(value)) {
      setValidationError("招待コードは英数字6文字で入力してください。");
      return;
    }
    setValidationError(null);
    try {
      const group = await joinGroup(value);
      router.push(`/onboarding/joined?name=${encodeURIComponent(group.name)}`);
    } catch {
      /* provider state */
    }
  }
  return (
    <MobileShell>
      <section className="onboarding-form">
        <h1>招待コードを入力しよう</h1>
        <div className="onboarding-cats" aria-hidden="true">
          ◡　◡
          <br />
          　◡
        </div>
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="invite-code">
            招待コード
          </label>
          <input
            id="invite-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            maxLength={6}
            placeholder="招待コードを入力してください"
          />
          {(validationError || error) && <ErrorState message={validationError ?? error ?? ""} />}
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "参加中" : "参加する"}
          </button>
        </form>
      </section>
    </MobileShell>
  );
}
