"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MenuIcon, SettingsIcon } from "@/components/icons";
import { MemberAvatars } from "@/components/member-avatars";
import { usePrepareTabTransition } from "@/components/route-transition";
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
  const prepareTransition = usePrepareTabTransition();
  const visible = pathname === "/home" || pathname === "/groups";
  if (!visible) {
    return null;
  }

  const homeActive = pathname === "/home" && !composeOpen;
  const groupsActive = pathname === "/groups" && !composeOpen;

  return (
    <nav className="bottom-tabs" aria-label="メインナビゲーション">
      <Image
        src="/images/ui/navigation/tab_bar.png"
        alt=""
        width={372}
        height={87}
        className="bottom-tabs__background"
      />
      <Link
        className={
          homeActive
            ? "bottom-tabs__item bottom-tabs__item--home is-active"
            : "bottom-tabs__item bottom-tabs__item--home"
        }
        href="/home"
        aria-current={homeActive ? "page" : undefined}
        onClick={() => prepareTransition("/home")}
      >
        {homeActive && (
          <Image
            src="/images/ui/decorations/active_tab.png"
            alt=""
            width={21}
            height={18}
            className="bottom-tabs__active-mark"
          />
        )}
        <Image
          src="/images/ui/navigation/home-button.png"
          alt=""
          width={62}
          height={62}
          className="bottom-tabs__icon bottom-tabs__icon--home"
        />
        <span className="sr-only">ホーム</span>
      </Link>
      <button
        type="button"
        className={composeOpen ? "bottom-tabs__compose is-active" : "bottom-tabs__compose"}
        onClick={openCompose}
        aria-pressed={composeOpen}
      >
        <Image
          src="/images/ui/decorations/tubuyaku_btn (1).png"
          alt=""
          width={79}
          height={73}
          className="bottom-tabs__compose-image"
        />
        <span className="sr-only">つぶやく</span>
      </button>
      <Link
        className={
          groupsActive
            ? "bottom-tabs__item bottom-tabs__item--groups is-active"
            : "bottom-tabs__item bottom-tabs__item--groups"
        }
        href="/groups"
        aria-current={groupsActive ? "page" : undefined}
        onClick={() => prepareTransition("/groups")}
      >
        {groupsActive && (
          <Image
            src="/images/ui/decorations/active_tab.png"
            alt=""
            width={21}
            height={18}
            className="bottom-tabs__active-mark bottom-tabs__active-mark--groups"
          />
        )}
        <Image
          src="/images/ui/navigation/group-button.png"
          alt=""
          width={68}
          height={68}
          className="bottom-tabs__icon bottom-tabs__icon--groups"
        />
        <span className="sr-only">グループ</span>
      </Link>
    </nav>
  );
}
