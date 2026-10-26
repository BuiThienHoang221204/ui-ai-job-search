"use client";

import { useMemo, useSyncExternalStore } from "react";

let clientSeed = 0;

function getClientSeed(): number {
  if (clientSeed === 0) clientSeed = Math.floor(Math.random() * 10_000) + 1;
  return clientSeed;
}

/** Số xoay tua để các gợi ý sản phẩm lần lượt hiện đều; khi render ở server trả 0 để không lệch hydration. */
export function useRotation(seed?: string | number | null): number {
  const randomOffset = useSyncExternalStore(
    () => () => {},
    getClientSeed,
    () => 0,
  );
  return useMemo(() => {
    let hash = 0;
    const str = String(seed ?? "");
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
    }
    return Math.abs(hash) + randomOffset;
  }, [randomOffset, seed]);
}
