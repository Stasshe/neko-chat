"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

import { ComposeIcon, MenuIcon, SettingsIcon } from "@/components/icons";
import { MemberAvatars } from "@/components/member-avatars";
import { useApp } from "@/state/app-provider";
import type { PostUser } from "@/types/app";

export function TopBar({ groupName, members }: { groupName: string; members: PostUser[] }) {
  return (
    <header className="top-bar">
      <Link className="top-bar__action" href="/chat" aria-label="チャット">
        <MenuIcon />
        <span>チャット</span>
      </Link>
      <div className="top-bar__title">
        <MemberAvatars members={members} />
        <strong>{groupName}</strong>
      </div>
      <Link className="top-bar__action" href="/settings" aria-label="設定">
        <SettingsIcon />
        <span>設定</span>
      </Link>
    </header>
  );
}

export function BottomTabBar() {
  const pathname = usePathname();
  const { composeOpen, openCompose } = useApp();
  const visible = pathname === "/home" || pathname === "/groups";
  if (!visible) {
    return null;
  }

  const homeActive = pathname === "/home" && !composeOpen;
  const groupsActive = pathname === "/groups" && !composeOpen;
  let activeIndex = 0;
  if (composeOpen) {
    activeIndex = 1;
  } else if (groupsActive) {
    activeIndex = 2;
  }
  const indicatorStyle = { "--active-tab": activeIndex } as CSSProperties;

  return (
    <nav className="bottom-tabs" aria-label="メインナビゲーション">
      <span className="bottom-tabs__indicator-track" aria-hidden="true">
        <span className="bottom-tabs__indicator" style={indicatorStyle} />
      </span>
      <Link
        className={homeActive ? "bottom-tabs__item is-active" : "bottom-tabs__item"}
        href="/home"
        aria-current={homeActive ? "page" : undefined}
      >
        <Image src="/images/ui/navigation/home-button.png" alt="" width={29} height={29} />
        <span>ホーム</span>
      </Link>
      <button
        type="button"
        className={composeOpen ? "bottom-tabs__item is-active" : "bottom-tabs__item"}
        onClick={openCompose}
        aria-pressed={composeOpen}
      >
        <ComposeIcon />
        <span>つぶやく</span>
      </button>
      <Link
        className={groupsActive ? "bottom-tabs__item is-active" : "bottom-tabs__item"}
        href="/groups"
        aria-current={groupsActive ? "page" : undefined}
      >
        <Image src="/images/ui/navigation/group-button.png" alt="" width={29} height={29} />
        <span>グループ</span>
      </Link>
    </nav>
  );
}
