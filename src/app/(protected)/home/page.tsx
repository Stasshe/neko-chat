"use client";

import { animate, type JSAnimation, stagger } from "animejs";
import { type MotionStyle, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import { type RefObject, useEffect, useRef, useState } from "react";
import type { Step } from "react-joyride";

import { CatDisplay } from "@/components/cat-display";
import { MenuIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { OnboardingTour } from "@/components/onboarding-tour";
import { SpeechBubble } from "@/components/speech-bubble";
import { EmptyState, ErrorState, LoadingState } from "@/components/status";
import { formatPostBody } from "@/lib/post-body";
import { setTourStage, useTourStage } from "@/lib/tour";
import { type OptimisticPost, useApp } from "@/state/app-provider";
import type { PostUser } from "@/types/app";

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

type RoomPostLayout = MotionStyle & {
  "--scene-cat-height": string;
  "--scene-cat-width": string;
};

const firstParkScenePostConfig: ScenePostConfig = { align: "right", pose: "sit" };

const parkScenePostConfigs: ScenePostConfig[] = [
  firstParkScenePostConfig,
  { align: "left", pose: "stand" },
  { align: "right", pose: "lie" },
  { align: "left", pose: "sit" },
  { align: "right", pose: "stand" },
];

const firstRoomPostLayout: RoomPostLayout = {
  top: "40%",
  left: "6%",
  width: 130,
  "--scene-cat-width": "110px",
  "--scene-cat-height": "82px",
};

const roomPostLayouts: RoomPostLayout[] = [
  firstRoomPostLayout,
  {
    right: "6%",
    bottom: "10%",
    width: 150,
    "--scene-cat-width": "130px",
    "--scene-cat-height": "95px",
  },
  {
    top: "18%",
    right: "6%",
    width: 120,
    "--scene-cat-width": "100px",
    "--scene-cat-height": "75px",
  },
  {
    top: "5%",
    left: "35%",
    width: 110,
    "--scene-cat-width": "90px",
    "--scene-cat-height": "68px",
  },
  {
    bottom: "30%",
    left: "38%",
    width: 110,
    "--scene-cat-width": "90px",
    "--scene-cat-height": "68px",
  },
];

const homeBackgroundStorageKey = "neko-chat.home-background";

function readStoredHomeBackground(): 0 | 1 {
  if (typeof window === "undefined") {
    return 0;
  }
  return window.localStorage.getItem(homeBackgroundStorageKey) === "1" ? 1 : 0;
}

function storeHomeBackground(page: 0 | 1) {
  window.localStorage.setItem(homeBackgroundStorageKey, String(page));
}

const bubbleDurationMs = 30 * 60 * 1000;

function isBubbleVisible(createdAt: string, now: number): boolean {
  return now - new Date(createdAt).getTime() < bubbleDurationMs;
}

function getLatestPostsByUser(posts: OptimisticPost[]): OptimisticPost[] {
  const latestByUser = new Map<string, OptimisticPost>();
  for (const post of posts) {
    if (!latestByUser.has(post.userId)) {
      latestByUser.set(post.userId, post);
    }
  }
  return [...latestByUser.values()].sort((a, b) => a.userId.localeCompare(b.userId));
}

function useBubbleClock(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
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

function getPostClassName(index: number, pending: boolean | undefined, room = false) {
  const classNames = ["scene-post", room ? "scene-post--room" : `scene-post--${index + 1}`];
  if (pending) {
    classNames.push("scene-post--pending");
  }
  return classNames.join(" ");
}

function HomeHeader({ groupName, memberCount }: { groupName: string; memberCount: number }) {
  const visibleMemberCount = Math.min(Math.max(memberCount, 1), 5);
  const memberSlots = Array.from(
    { length: visibleMemberCount },
    (_, index) => `home-member-${index + 1}`,
  );

  return (
    <header className="home-header">
      <Link className="home-header__action" href="/chat" aria-label="チャット">
        <MenuIcon />
        <span>チャット</span>
      </Link>
      <div className="home-header__title">
        <div className="home-header__members" aria-label={`${memberCount}人のメンバー`} role="img">
          {memberSlots.map((slot) => (
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

function ParkPost({ post, index, bubbleVisible, reducedMotion, pageRef }: PostProps) {
  const config = parkScenePostConfigs[index] ?? firstParkScenePostConfig;
  return (
    <m.article
      className={getPostClassName(index, post.pending)}
      drag={!reducedMotion}
      dragConstraints={pageRef}
      dragMomentum={false}
      whileDrag={{ scale: 1.04, zIndex: 12 }}
    >
      <div className="scene-post__float">
        {bubbleVisible && (
          <SpeechBubble align={config.align}>{formatPostBody(post.body)}</SpeechBubble>
        )}
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
}

type PostProps = {
  post: OptimisticPost;
  index: number;
  bubbleVisible: boolean;
  reducedMotion: boolean | null;
  pageRef: RefObject<HTMLDivElement | null>;
};

function RoomPost({ post, index, bubbleVisible, reducedMotion, pageRef }: PostProps) {
  const layout = roomPostLayouts[index] ?? firstRoomPostLayout;
  return (
    <m.article
      className={getPostClassName(index, post.pending, true)}
      style={layout}
      drag={!reducedMotion}
      dragConstraints={pageRef}
      dragMomentum={false}
      whileDrag={{ scale: 1.04, zIndex: 12 }}
    >
      <div className="scene-post__float">
        {bubbleVisible && (
          <SpeechBubble align={index % 2 === 0 ? "left" : "right"}>
            {formatPostBody(post.body)}
          </SpeechBubble>
        )}
        <CatDisplay
          type={post.user.catType}
          emotion={post.emotion}
          className="scene-post__cat"
          seed={post.id}
        />
        <span className="scene-post__name">{post.user.username}</span>
      </div>
    </m.article>
  );
}

export default function HomePage() {
  const { profile, currentGroup, posts, loading, error, refresh } = useApp();
  const tourStage = useTourStage(profile?.id);
  const tourRun = Boolean(profile && currentGroup && (tourStage === null || tourStage === "home"));
  const uniquePosts = getLatestPostsByUser(posts);
  const sceneRef = useParkAnimation(uniquePosts.length);
  const parkPageRef = useRef<HTMLDivElement>(null);
  const roomPageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const bubbleClock = useBubbleClock();
  const [activePage, setActivePage] = useState<0 | 1>(0);

  useEffect(() => {
    const scene = sceneRef.current;
    const storedPage = readStoredHomeBackground();
    if (!scene || storedPage === 0) {
      return;
    }
    scene.scrollLeft = scene.clientWidth;
    setActivePage(storedPage);
  }, [sceneRef]);

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
  const scenePosts = uniquePosts.slice(
    0,
    Math.max(parkScenePostConfigs.length, roomPostLayouts.length),
  );

  return (
    <MobileShell>
      <OnboardingTour steps={homeTourSteps} run={tourRun} onFinish={finishHomeTour} />
      <HomeHeader
        groupName={currentGroup?.name ?? "グループ名"}
        memberCount={currentGroup?.memberCount ?? members.length}
      />
      <div className="park-scene-wrap">
        <section
          ref={sceneRef}
          className="park-scene"
          aria-label="グループの近況"
          onScroll={(event) => {
            const scene = event.currentTarget;
            const page = scene.scrollLeft > scene.clientWidth / 2 ? 1 : 0;
            setActivePage(page);
            storeHomeBackground(page);
          }}
        >
          <div ref={parkPageRef} className="park-scene__page">
            <Image
              src="/images/ui/backgrounds/home-green.png"
              alt=""
              fill
              priority
              sizes="393px"
              className="park-scene__bg"
            />
            <HomeSceneDecorations />
            {!loading &&
              !error &&
              scenePosts.map((post, index) => (
                <ParkPost
                  key={post.userId}
                  post={post}
                  index={index}
                  bubbleVisible={post.pending || isBubbleVisible(post.createdAt, bubbleClock)}
                  reducedMotion={reducedMotion}
                  pageRef={parkPageRef}
                />
              ))}
          </div>
          <div ref={roomPageRef} className="park-scene__page park-scene__page--room">
            <Image
              src="/images/ui/backgrounds/home-brown.png"
              alt=""
              fill
              sizes="393px"
              className="park-scene__bg"
            />
            <Image
              src="/images/ui/decorations/sofa.png"
              alt=""
              width={150}
              height={110}
              className="park-scene__sofa"
            />
            <Image
              src="/images/ui/decorations/yarn-ball.png"
              alt=""
              width={48}
              height={48}
              className="park-scene__yarn"
            />
            {!loading &&
              !error &&
              scenePosts.map((post, index) => (
                <RoomPost
                  key={post.userId}
                  post={post}
                  index={index}
                  bubbleVisible={post.pending || isBubbleVisible(post.createdAt, bubbleClock)}
                  reducedMotion={reducedMotion}
                  pageRef={roomPageRef}
                />
              ))}
          </div>
        </section>
        <div className="park-scene__dots" aria-hidden="true">
          <span className={activePage === 0 ? "is-active" : undefined} />
          <span className={activePage === 1 ? "is-active" : undefined} />
        </div>
        {loading && <LoadingState label="みんなの近況を読み込み中" />}
        {!loading && error && <ErrorState message={error} retry={() => void refresh()} />}
        {!loading && !error && uniquePosts.length === 0 && (
          <EmptyState message="まだつぶやきがありません。最初の一言を届けよう。" />
        )}
      </div>
    </MobileShell>
  );
}
