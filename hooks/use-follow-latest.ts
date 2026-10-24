"use client";

import { useCallback, useEffect, useRef } from "react";

const NEAR_BOTTOM_PX = 160;

/** Bám đáy khung chat: nội dung mới đến thì cuộn tới mốc cuối, trừ khi người dùng đã kéo lên đọc đoạn cũ; `follow` ép bám lại, như lúc vừa gửi câu trả lời. */
export function useFollowLatest(content: unknown) {
  const anchor = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  useEffect(() => {
    const onScroll = () => {
      const bottom = window.innerHeight + window.scrollY;
      pinned.current =
        bottom >= document.documentElement.scrollHeight - NEAR_BOTTOM_PX;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pinned.current) anchor.current?.scrollIntoView({ block: "end" });
  }, [content]);

  const follow = useCallback(() => {
    pinned.current = true;
    anchor.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  return { anchor, follow };
}
