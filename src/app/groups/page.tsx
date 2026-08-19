"use client";

import Link from "next/link";

import { CatDisplay } from "@/components/cat-display";
import { PlusIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { BottomTabBar } from "@/components/navigation";
import { EmptyState, ErrorState, LoadingState } from "@/components/status";
import { useApp } from "@/state/app-provider";
import type { CatType } from "@/types/app";

const previewCats: CatType[] = ["white", "mike", "black"];

export default function GroupsPage() {
  const { groups, currentGroup, loading, error, refresh, selectGroup } = useApp();

  return (
    <MobileShell>
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
                <span className="group-tile__scene">
                  {previewCats.slice(0, Math.min(group.memberCount, 3)).map((cat) => (
                    <CatDisplay key={`${group.id}-${cat}`} type={cat} pose="lie" />
                  ))}
                </span>
                <strong>{group.name}</strong>
                <span>{group.memberCount}人</span>
              </button>
            );
          })}
        <Link className="group-tile group-tile--add" href="/onboarding/mode">
          <PlusIcon />
          <span>新規グループを作成</span>
        </Link>
      </section>
      <BottomTabBar />
    </MobileShell>
  );
}
