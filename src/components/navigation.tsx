"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ComposeIcon, GroupsIcon, HomeIcon, MenuIcon, SettingsIcon } from "@/components/icons";
import { MemberAvatars } from "@/components/member-avatars";
import type { PostUser } from "@/types/app";

export function TopBar({ groupName, members }: { groupName: string; members: PostUser[] }) {
  return (
    <header className="top-bar">
      <Link className="top-bar__action" href="/groups" aria-label="グループ一覧">
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

const tabs = [
  { href: "/home", label: "ホーム", icon: HomeIcon },
  { href: "/compose", label: "つぶやく", icon: ComposeIcon },
  { href: "/groups", label: "グループ", icon: GroupsIcon },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav className="bottom-tabs" aria-label="メインナビゲーション">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = pathname === tab.href;
        const classes = ["bottom-tabs__item"];
        let current: "page" | undefined;
        if (active) {
          classes.push("is-active");
          current = "page";
        }
        return (
          <Link className={classes.join(" ")} href={tab.href} key={tab.href} aria-current={current}>
            <Icon />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
