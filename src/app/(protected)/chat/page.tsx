"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { ArrowLeftIcon, SendIcon, SettingsIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { useApp } from "@/state/app-provider";

import styles from "./page.module.css";

const memberSlots = [0, 1, 2, 3, 4];

export default function ChatPage() {
  const { profile, currentGroup, posts, loading, error, publishPost } = useApp();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const orderedPosts = [...posts].reverse();
  const latestPostId = posts[0]?.id;
  const memberCount = currentGroup?.memberCount ?? 0;

  useEffect(() => {
    if (!latestPostId) {
      return;
    }
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [latestPostId]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = message.trim();
    if (!body || loading || !currentGroup) {
      return;
    }

    try {
      await publishPost(body, "neutral");
      setMessage("");
    } catch {
      // AppProvider exposes request failures through its error state.
    }
  }

  return (
    <MobileShell>
      <div className={styles.page}>
        <header className={styles.header}>
          <Link className={styles.headerAction} href="/home" aria-label="ホームへ戻る">
            <ArrowLeftIcon />
            <span>ホームへ</span>
          </Link>
          <div className={styles.title}>
            <div className={styles.members} role="img" aria-label={`${memberCount}人のメンバー`}>
              {memberSlots.slice(0, memberCount).map((slot) => (
                <Image
                  key={slot}
                  src="/images/ui/icons/cat-outline.png"
                  alt=""
                  width={22}
                  height={22}
                />
              ))}
            </div>
            <h1>{currentGroup?.name ?? "グループ"}</h1>
          </div>
          <Link className={styles.headerAction} href="/settings" aria-label="設定">
            <SettingsIcon />
            <span>設定</span>
          </Link>
        </header>

        <section className={styles.messages} aria-label="チャットメッセージ" aria-live="polite">
          {!loading && orderedPosts.length === 0 && !error && (
            <p className={styles.empty}>まだメッセージはありません。</p>
          )}
          {orderedPosts.map((post) => {
            const ownMessage = post.userId === profile?.id;
            return (
              <article
                className={`${styles.message} ${ownMessage ? styles.ownMessage : ""}`}
                key={post.id}
              >
                <span className={styles.author}>{post.user.username}</span>
                <p className={styles.bubble}>{post.body}</p>
              </article>
            );
          })}
          <div ref={messagesEndRef} aria-hidden="true" />
        </section>

        <form className={styles.composer} onSubmit={submitMessage}>
          <label className={styles.visuallyHidden} htmlFor="chat-message">
            メッセージ
          </label>
          <input
            id="chat-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={30}
            autoComplete="off"
            enterKeyHint="send"
            disabled={!currentGroup}
          />
          <button
            type="submit"
            aria-label="メッセージを送信"
            disabled={!message.trim() || loading || !currentGroup}
          >
            <SendIcon />
          </button>
        </form>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </MobileShell>
  );
}
