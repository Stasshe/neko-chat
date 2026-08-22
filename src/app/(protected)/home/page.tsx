"use client";

import { animate, type JSAnimation, stagger } from "animejs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { CatDisplay } from "@/components/cat-display";
import { ComposeIcon, MenuIcon, SettingsIcon } from "@/components/icons";
import { MemberAvatars } from "@/components/member-avatars";
import { MobileShell } from "@/components/mobile-shell";
import { SpeechBubble } from "@/components/speech-bubble";
import { EmptyState, ErrorState, LoadingState } from "@/components/status";
import { useApp } from "@/state/app-provider";
import type { PostUser } from "@/types/app";

function getBubbleAlignment(index: number): "left" | "right" {
  if (index % 2 === 0) {
    return "left";
  }
  return "right";
}

function getCatPose(index: number): "sit" | "stand" | "lie" {
  if (index === 2) {
    return "lie";
  }
  if (index === 1) {
    return "sit";
  }
  return "stand";
}

function useParkAnimation(postCount: number) {
  const sceneRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (
      !scene ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const animations: JSAnimation[] = [];
    const cloud = scene.querySelector(".park-scene__cloud--one");
    if (cloud) {
      animations.push(
        animate(cloud, {
          x: 12,
          duration: 6000,
          ease: "inOutSine",
          alternate: true,
          loop: true,
        }),
      );
    }
    if (postCount > 0) {
      animations.push(
        animate(scene.querySelectorAll(".scene-post"), {
          y: -5,
          duration: 2200,
          delay: stagger(320),
          ease: "inOutSine",
          alternate: true,
          loop: true,
        }),
      );
    }

    return () => {
      for (const animation of animations) {
        animation.revert();
      }
    };
  }, [postCount]);

  return sceneRef;
}

export default function HomePage() {
  const { profile, currentGroup, posts, loading, error, refresh } = useApp();
  const sceneRef = useParkAnimation(posts.length);
  const uniqueMembers = new Map<string, PostUser>();

  if (profile) {
    uniqueMembers.set(profile.id, profile);
  }

  for (const post of posts) {
    uniqueMembers.set(post.user.id, post.user);
  }

  const members = [...uniqueMembers.values()];

  return (
    <MobileShell scene>
      <header className="home-header">
        <Link
          className="home-header__action"
          href="/groups"
          aria-label="グループ一覧"
        >
          <MenuIcon />
          <span>チャット</span>
        </Link>
        <div className="home-header__title">
          <MemberAvatars members={members} />
          <strong>{currentGroup?.name ?? "グループ名"}</strong>
        </div>
        <Link
          className="home-header__action"
          href="/settings"
          aria-label="設定"
        >
          <SettingsIcon />
          <span>設定</span>
        </Link>
      </header>

      <section
        ref={sceneRef}
        className="park-scene"
        aria-label="グループの近況"
      >
        <Image
          src="/images/ui/backgrounds/home-green.png"
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 393px"
          className="park-scene__background"
        />
        <Image
          src="/images/ui/decorations/cloud.png"
          alt=""
          width={83}
          height={44}
          className="park-scene__cloud park-scene__cloud--one"
        />
        <Image
          src="/images/ui/decorations/cloud.png"
          alt=""
          width={83}
          height={44}
          className="park-scene__cloud park-scene__cloud--two"
        />
        <Image
          src="/images/ui/decorations/tree.png"
          alt=""
          width={164}
          height={145}
          className="park-scene__tree park-scene__tree--large"
        />
        <Image
          src="/images/ui/decorations/tree.png"
          alt=""
          width={164}
          height={145}
          className="park-scene__tree park-scene__tree--small"
        />
        <Image
          src="/images/ui/decorations/tree-stump.png"
          alt=""
          width={102}
          height={82}
          className="park-scene__stump"
        />

        {loading && <LoadingState label="みんなの近況を読み込み中" />}
        {!loading && error && (
          <ErrorState message={error} retry={() => void refresh()} />
        )}
        {!loading && !error && posts.length === 0 && (
          <EmptyState message="まだつぶやきがありません。最初の一言を届けよう。" />
        )}
        {!loading &&
          !error &&
          posts.slice(0, 4).map((post, index) => (
            <article
              className={`scene-post scene-post--${index + 1}`}
              key={post.id}
            >
              <SpeechBubble align={getBubbleAlignment(index)}>
                {post.body}
              </SpeechBubble>
              <CatDisplay
                type={post.user.catType}
                emotion={post.emotion}
                pose={getCatPose(index)}
                className="scene-post__cat"
                seed={post.id}
              />
              <span className="scene-post__name">{post.user.username}</span>
            </article>
          ))}
      </section>

      <nav className="home-dock" aria-label="メインナビゲーション">
        <Link className="home-dock__item" href="/home" aria-current="page">
          <Image
            src="/images/ui/navigation/home-button.png"
            alt=""
            width={51}
            height={49}
          />
          <span>ホーム</span>
        </Link>
        <Link className="home-dock__compose" href="/compose">
          <span className="home-dock__compose-circle">
            <ComposeIcon />
          </span>
          <span>つぶやく</span>
        </Link>
        <Link className="home-dock__item" href="/groups">
          <Image
            src="/images/ui/navigation/group-button.png"
            alt=""
            width={56}
            height={20}
          />
          <span>グループ</span>
        </Link>
      </nav>
    </MobileShell>
  );
}
