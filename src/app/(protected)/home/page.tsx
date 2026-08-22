"use client";

import Image from "next/image";
import { type MotionStyle, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef } from "react";
import type { Step } from "react-joyride";
import { animate, type JSAnimation, stagger } from "animejs";

import { CatDisplay } from "@/components/cat-display";
import { MobileShell } from "@/components/mobile-shell";
import { TopBar } from "@/components/navigation";
import { OnboardingTour } from "@/components/onboarding-tour";
import { SpeechBubble } from "@/components/speech-bubble";
import { EmptyState, ErrorState, LoadingState } from "@/components/status";
import { setTourStage, useTourStage } from "@/lib/tour";
import { useApp } from "@/state/app-provider";
import type { PostUser } from "@/types/app";

const homeTourSteps: Step[] = [
  {
    target: ".top-bar__title",
    content: "ここに今いる場所が表示されるよ。",
    placement: "bottom",
  },
  {
    target: ".park-scene",
    content: "みんなのつぶやきがここに集まるよ。",
    placement: "center",
  },
  {
    target: ".bottom-tabs__item:nth-child(2)",
    content: "ここから気持ちをつぶやいてみよう。",
    placement: "top",
  },
];

type ScenePostLayout = MotionStyle & {
  "--scene-cat-height": string;
  "--scene-cat-width": string;
};

const firstScenePostLayout: ScenePostLayout = {
  top: "23%",
  right: "4%",
  width: 130,
  "--scene-cat-width": "110px",
  "--scene-cat-height": "82px",
};

const scenePostLayouts: ScenePostLayout[] = [
  firstScenePostLayout,
  {
    top: "51%",
    left: "2%",
    width: 130,
    "--scene-cat-width": "110px",
    "--scene-cat-height": "82px",
  },
  {
    right: "1%",
    bottom: "13%",
    width: 175,
    "--scene-cat-width": "155px",
    "--scene-cat-height": "100px",
  },
  {
    bottom: "7%",
    left: "3%",
    width: 130,
    "--scene-cat-width": "110px",
    "--scene-cat-height": "82px",
  },
];

function getBubbleAlignment(index: number): "left" | "right" {
  if (index % 2 === 0) {
    return "left";
  }
  return "right";
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
        animate(scene.querySelectorAll(".scene-post__float"), {
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
  const tourStage = useTourStage(profile?.id);
  const tourRun = Boolean(profile && currentGroup && (tourStage === null || tourStage === "home"));
  const sceneRef = useParkAnimation(posts.length);
  const reducedMotion = useReducedMotion();

  function finishHomeTour() {
    if (profile) {
      setTourStage(profile.id, "compose");
    }
  }
  const uniqueMembers = new Map<string, PostUser>();
  if (profile) {
    uniqueMembers.set(profile.id, profile);
  }
  for (const post of posts) {
    uniqueMembers.set(post.user.id, post.user);
  }
  const members = [...uniqueMembers.values()];

  return (
    <MobileShell>
      <OnboardingTour steps={homeTourSteps} run={tourRun} onFinish={finishHomeTour} />
      <TopBar groupName={currentGroup?.name ?? "グループ"} members={members} />
      <section ref={sceneRef} className="park-scene" aria-label="グループの近況">
        <Image
          src="/images/ui/backgrounds/home-green.png"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 100vw, 393px"
          className="park-scene__bg"
        />
        <Image
          src="/images/ui/decorations/cloud.png"
          alt=""
          width={57}
          height={36}
          className="park-scene__cloud park-scene__cloud--one"
        />
        <Image
          src="/images/ui/decorations/cloud.png"
          alt=""
          width={43}
          height={27}
          className="park-scene__cloud park-scene__cloud--two"
        />
        <Image
          src="/images/ui/decorations/tree.png"
          alt=""
          width={90}
          height={90}
          className="park-scene__tree park-scene__tree--large"
        />
        <Image
          src="/images/ui/decorations/tree.png"
          alt=""
          width={63}
          height={63}
          className="park-scene__tree park-scene__tree--small"
        />
        <Image
          src="/images/ui/decorations/tree-stump.png"
          alt=""
          width={78}
          height={55}
          className="park-scene__stump"
        />

        {loading && <LoadingState label="みんなの近況を読み込み中" />}
        {!loading && error && <ErrorState message={error} retry={() => void refresh()} />}
        {!loading && !error && posts.length === 0 && (
          <EmptyState message="まだつぶやきがありません。最初の一言を届けよう。" />
        )}
        {!loading &&
          !error &&
          posts.slice(0, 4).map((post, index) => (
            <m.article
              className="scene-post"
              style={scenePostLayouts[index] ?? firstScenePostLayout}
              key={post.id}
              drag={!reducedMotion}
              dragConstraints={sceneRef}
              dragMomentum={false}
              whileDrag={{ scale: 1.04, zIndex: 12 }}
            >
              <div className="scene-post__float">
                <SpeechBubble align={getBubbleAlignment(index)}>{post.body}</SpeechBubble>
                <CatDisplay
                  type={post.user.catType}
                  emotion={post.emotion}
                  className="scene-post__cat"
                  seed={post.id}
                  priority={index === 0}
                />
                <span className="scene-post__name">{post.user.username}</span>
              </div>
            </m.article>
          ))}
      </section>
    </MobileShell>
  );
}
