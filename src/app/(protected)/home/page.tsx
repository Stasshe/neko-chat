"use client";

import { animate, type JSAnimation, stagger } from "animejs";
import { useEffect, useRef } from "react";

import { CatDisplay } from "@/components/cat-display";
import { MobileShell } from "@/components/mobile-shell";
import { BottomTabBar, TopBar } from "@/components/navigation";
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
    if (!scene || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
      <TopBar groupName={currentGroup?.name ?? "グループ"} members={members} />
      <section ref={sceneRef} className="park-scene" aria-label="グループの近況">
        <div className="park-scene__sky" />
        <div className="park-scene__cloud park-scene__cloud--one" />
        <div className="park-scene__cloud park-scene__cloud--two" />
        <div className="park-scene__tree park-scene__tree--large" />
        <div className="park-scene__tree park-scene__tree--small" />
        <div className="park-scene__ground" />
        <div className="park-scene__stump" />

        {loading && <LoadingState label="みんなの近況を読み込み中" />}
        {!loading && error && <ErrorState message={error} retry={() => void refresh()} />}
        {!loading && !error && posts.length === 0 && (
          <EmptyState message="まだつぶやきがありません。最初の一言を届けよう。" />
        )}
        {!loading &&
          !error &&
          posts.slice(0, 4).map((post, index) => (
            <article className={`scene-post scene-post--${index + 1}`} key={post.id}>
              <SpeechBubble align={getBubbleAlignment(index)}>{post.body}</SpeechBubble>
              <CatDisplay
                type={post.user.catType}
                emotion={post.emotion}
                pose={getCatPose(index)}
                className="scene-post__cat"
              />
              <span className="scene-post__name">{post.user.username}</span>
            </article>
          ))}
      </section>
      <BottomTabBar />
    </MobileShell>
  );
}
