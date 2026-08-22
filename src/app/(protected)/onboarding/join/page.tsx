"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";
import { BackLink } from "@/components/back-link";
import { Button } from "@/components/button";
import { CatDisplay } from "@/components/cat-display";
import { MobileShell } from "@/components/mobile-shell";
import { ErrorState } from "@/components/status";
import { TextField } from "@/components/text-field";
import { useApp } from "@/state/app-provider";

function allowlistedReturnPath(value: string | null): "/groups" | null {
  if (value === "groups") {
    return "/groups";
  }
  return null;
}

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { joinGroup, loading, error } = useApp();
  const [code, setCode] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const returnPath = allowlistedReturnPath(searchParams.get("returnTo"));
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
      const query = new URLSearchParams({ name: group.name });
      if (returnPath) {
        query.set("returnTo", "groups");
      }
      router.replace(`/onboarding/joined?${query.toString()}`);
    } catch {
      /* provider state */
    }
  }
  return (
    <MobileShell>
      <BackLink href={returnPath ?? "/onboarding/mode"} />
      <section className="onboarding-form onboarding-form--join">
        <h1>招待コードを入力しよう</h1>
        <div className="onboarding-join__cats" aria-hidden="true">
          <CatDisplay
            type="black"
            emotion="negative"
            priority
            className="onboarding-join__cat onboarding-join__cat--black"
          />
          <CatDisplay
            type="mike"
            emotion="negative"
            className="onboarding-join__cat onboarding-join__cat--mike"
          />
          <CatDisplay
            type="white"
            emotion="negative"
            className="onboarding-join__cat onboarding-join__cat--white"
          />
        </div>
        <form onSubmit={submit}>
          <TextField
            id="invite-code"
            label="招待コード"
            labelClassName="field-label onboarding-join__label"
            value={code}
            onChange={(value) => setCode(value.toUpperCase())}
            maxLength={6}
            placeholder="招待コードを入力してください"
          />
          {(validationError || error) && <ErrorState message={validationError ?? error ?? ""} />}
          <Button type="submit" disabled={loading} className="onboarding-join__button">
            {loading ? "参加中" : "参加する"}
          </Button>
        </form>
      </section>
    </MobileShell>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <JoinContent />
    </Suspense>
  );
}
