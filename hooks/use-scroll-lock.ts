"use client";

import { useEffect } from "react";

/** Khoá cuộn trang khi `locked`, trên `<html>` vì `globals.css` đặt `overflow-x: clip` ở đó nên khoá `<body>` không ăn. */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
    };
  }, [locked]);
}
