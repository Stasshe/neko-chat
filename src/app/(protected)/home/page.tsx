"use client";

import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { Step } from "react-joyride";

import { CatDisplay } from "@/components/cat-display";
import { MenuIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { OnboardingTour } from "@/components/onboarding-tour";
import { SpeechBubble } from "@/components/speech-bubble";
import { ErrorState, LoadingState } from "@/components/status";
import { setTourStage, useTourStage } from "@/lib/tour";
import { useApp } from "@/state/app-provider";
import type { Emotion, PostUser } from "@/types/app";

const homeTourSteps: Step[] = [
  {
    target: ".home-header__title",
    content: "ここに今いる場所が表示されるよ。",
    placement: "bottom",
  },
  {
    target: ".park-scene",
    content: "みんなのつぶやきがここに集まるよ。",
    placement: "center",
  },
  {
    target: ".bottom-tabs__compose",
    content: "ここから気持ちをつぶやいてみよう。",
    placement: "top",
  },
];

type ScenePostConfig = {
  align: "left" | "right";
  pose: "sit" | "stand" | "lie";
};

type ScenePostItem = {
  id: string;
  body: string;
  emotion: Emotion;
  user: Pick<PostUser, "username" | "catType">;
};

const firstParkScenePostConfig: ScenePostConfig = { align: "right", pose: "sit" };

const parkScenePostConfigs: ScenePostConfig[] = [
  firstParkScenePostConfig,
  { align: "left", pose: "stand" },
  { align: "right", pose: "lie" },
];

const homeHeaderMemberSlots = ["first", "second", "third"] as const;
const mockScenePosts: ScenePostItem[] = [
  {
    id: "mock-user-3",
    body: "早起きできた ニャー",
    emotion: "negative",
    user: {
      username: "ユーザー3",
      catType: "white",
    },
  },
  {
    id: "mock-user-1",
    body: "いまからバイト行く ニャー",
    emotion: "neutral",
    user: {
      username: "ユーザー1",
      catType: "white",
    },
  },
  {
    id: "mock-user-2",
    body: "がんばれ ニャー",
    emotion: "positive",
    user: {
      username: "ユーザー2",
      catType: "white",
    },
  },
];

function HomeHeader({ groupName, memberCount }: { groupName: string; memberCount: number }) {
  const visibleMemberCount = Math.min(Math.max(memberCount, 1), 3);

  return (
    <header className="home-header">
      <Link className="home-header__action" href="/chat" aria-label="チャット">
        <MenuIcon />
        <span>チャット</span>
      </Link>

      <div className="home-header__title">
        <div className="home-header__members" aria-hidden="true">
          {homeHeaderMemberSlots.slice(0, visibleMemberCount).map((slot) => (
            <Image
              key={slot}
              src="/images/ui/icons/cat-outline.png"
              alt=""
              width={45}
              height={45}
              className="home-header__member-icon"
            />
          ))}
        </div>
        <strong>{groupName}</strong>
      </div>

      <Link className="home-header__action" href="/settings" aria-label="設定">
        <Image
          src="/images/ui/icons/setting.png"
          alt=""
          width={30}
          height={30}
          className="home-header__settings-icon"
        />
        <span>設定</span>
      </Link>
    </header>
  );
}

function HomeSceneDecorations() {
  return (
    <>
      <Image
        src="/images/ui/decorations/cloud.png"
        alt=""
        width={109}
        height={69}
        className="park-scene__cloud park-scene__cloud--one"
      />
      <Image
        src="/images/ui/decorations/cloud.png"
        alt=""
        width={109}
        height={69}
        className="park-scene__cloud park-scene__cloud--two"
      />
      <Image
        src="/images/ui/decorations/tree.png"
        alt=""
        width={174}
        height={174}
        className="park-scene__tree park-scene__tree--large"
      />

      <Image
        src="/images/ui/decorations/tree-stump.png"
        alt=""
        width={169}
        height={119}
        className="park-scene__stump"
      />
    </>
  );
}

export default function HomePage() {
  const { profile, currentGroup, posts, loading, error, refresh } = useApp();
  const tourStage = useTourStage(profile?.id);
  const tourRun = Boolean(profile && currentGroup && (tourStage === null || tourStage === "home"));
  const scenePostConfigs = parkScenePostConfigs;
  const showMockScene = !loading && !error && posts.length === 0;
  const visiblePosts: ScenePostItem[] = showMockScene
    ? mockScenePosts
    : posts.slice(0, scenePostConfigs.length);
  const sceneRef = useRef<HTMLElement>(null);
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
  const displayGroupName = showMockScene ? "グループ名" : (currentGroup?.name ?? "グループ名");
  const displayMemberCount = showMockScene ? 3 : (currentGroup?.memberCount ?? members.length);

  return (
    <MobileShell>
      <OnboardingTour steps={homeTourSteps} run={tourRun} onFinish={finishHomeTour} />
      <HomeHeader groupName={displayGroupName} memberCount={displayMemberCount} />
      <section ref={sceneRef} className="park-scene home-scene" aria-label="グループの近況">
        <Image
          src="/images/ui/backgrounds/home-green.png"
          alt=""
          width={393}
          height={852}
          priority
          sizes="(min-width: 768px) 100vw, 393px"
          className="park-scene__bg"
        />
        <HomeSceneDecorations />

        {loading && <LoadingState label="みんなの近況を読み込み中" />}
        {!loading && error && <ErrorState message={error} retry={() => void refresh()} />}
        {!loading &&
          !error &&
          visiblePosts.map((post, index) => {
            const config = scenePostConfigs[index] ?? firstParkScenePostConfig;

            return (
              <m.article
                className={`scene-post scene-post--${index + 1}`}
                key={post.id}
                drag={!reducedMotion}
                dragConstraints={sceneRef}
                dragMomentum={false}
                whileDrag={{ scale: 1.04, zIndex: 12 }}
              >
                <div className="scene-post__float">
                  <SpeechBubble align={config.align}>{post.body}</SpeechBubble>
                  <CatDisplay
                    type={post.user.catType}
                    emotion={post.emotion}
                    pose={config.pose}
                    className="scene-post__cat"
                    seed={post.id}
                    priority={index === 0}
                  />
                  <span className="scene-post__name">{post.user.username}</span>
                </div>
              </m.article>
            );
          })}
      </section>
    </MobileShell>
  );
}
