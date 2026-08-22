"use client";

import Image from "next/image";
import Link from "next/link";

import { BackLink } from "@/components/back-link";
import { CatDisplay } from "@/components/cat-display";
import { PlusIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/status";
import { useApp } from "@/state/app-provider";
import type { CatType } from "@/types/app";

const previewCats: CatType[] = ["white", "mike", "black"];
const previewMemberSlots = ["first", "second", "third", "fourth", "fifth"] as const;

export default function GroupsPage() {
  const { groups, currentGroup, loading, error, refresh, selectGroup } = useApp();

  return (
    <MobileShell>
      <BackLink href="/home" label="ホームへ戻る" />
      <header className="page-heading">
        <h1>グループ一覧</h1>
      </header>
      <section className="group-list" aria-label="所属グループ">
        {loading && <LoadingState label="グループを読み込み中" />}
        {!loading && error && <ErrorState message={error} retry={() => void refresh()} />}
        {!loading && !error && groups.length === 0 && (
          <EmptyState message="所属しているグループはありません。" />
        )}
        {!loading &&
          !error &&
          groups.map((group) => {
            const active = currentGroup?.id === group.id;
            return (
              <button
                className="group-tile"
                type="button"
                onClick={() => void selectGroup(group)}
                key={group.id}
                aria-current={active}
              >
                <span
                  className="group-tile__members"
                  role="img"
                  aria-label={`${group.memberCount}人`}
                >
                  {previewMemberSlots.slice(0, group.memberCount).map((slot) => (
                    <Image
                      src="/images/ui/icons/cat-outline.png"
                      alt=""
                      width={18}
                      height={18}
                      key={`${group.id}-${slot}`}
                    />
                  ))}
                </span>
                <span className="group-tile__scene">
                  <Image
                    className="group-tile__stump"
                    src="/images/ui/decorations/tree-stump.png"
                    alt=""
                    width={78}
                    height={58}
                  />
                  {previewCats.slice(0, Math.min(group.memberCount, 3)).map((cat) => (
                    <CatDisplay key={`${group.id}-${cat}`} type={cat} />
                  ))}
                </span>
                <strong>{group.name}</strong>
              </button>
            );
          })}
        <Link className="group-tile group-tile--add" href="/onboarding/group?returnTo=groups">
          <PlusIcon />
          <span>新規グループを作成</span>
        </Link>
      </section>
    </MobileShell>
  );
}
