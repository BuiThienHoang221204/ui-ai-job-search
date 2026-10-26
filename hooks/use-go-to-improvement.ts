"use client";

import { useProfileUi } from "@/hooks/use-profile";
import type { Improvement } from "@/types";

/** Chuyển sang đúng tab hồ sơ rồi cuộn tới phần cần sửa. */
export function useGoToImprovement() {
  const setTab = useProfileUi((state) => state.setTab);
  return (item: Improvement) => {
    setTab(item.tab);
    requestAnimationFrame(() =>
      document
        .getElementById(item.anchor)
        ?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  };
}
