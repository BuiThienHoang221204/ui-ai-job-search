"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiErrorMessage } from "@/lib/axios";
import { invalidateAfter, keys } from "@/lib/query-keys";
import { learningService, profileService } from "@/services";
import type { LearningItem, SaveLearningInput, SkillGapItem } from "@/types";
import { useToast } from "@/hooks/use-toast";

/** Kỹ năng còn thiếu + kế hoạch học; đếm bằng code ở backend nên mở trang là có ngay. */
export function useLearning() {
  return useApiQuery(keys.learning(), () => learningService.overview(), {
    errorMessage: "Không tải được lộ trình học",
  });
}

/** Các thao tác trên một kỹ năng; `busyKey` giữ tới khi dữ liệu MỚI về, để lượt bấm kế tiếp không gửi đi trạng thái cũ. */
export function useLearningActions() {
  const client = useQueryClient();
  const toast = useToast();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const run = async (key: string, action: () => Promise<unknown>, done?: string) => {
    setBusyKey(key);
    try {
      await action();
      await client.invalidateQueries({ queryKey: keys.learning() });
      invalidateAfter(client, "learning");
      if (done) toast.success(done);
    } catch (cause) {
      toast.danger(apiErrorMessage(cause, "Không lưu được thay đổi"));
    } finally {
      setBusyKey(null);
    }
  };

  const save = (key: string, input: SaveLearningInput, done?: string) =>
    run(key, () => learningService.save(key, input), done);

  return {
    busyKey,
    learn: (gap: SkillGapItem) =>
      save(gap.key, { skillName: gap.name, status: "LEARNING" }),
    skip: (gap: SkillGapItem) =>
      save(gap.key, { skillName: gap.name, status: "SKIPPED" }),
    know: (gap: SkillGapItem) =>
      run(
        gap.key,
        () => profileService.addSkill(gap.name),
        `Đã thêm ${gap.name} vào hồ sơ.`,
      ),
    remove: (key: string) => run(key, () => learningService.remove(key)),
    setStudyTime: (studyTime: string) =>
      run("study-time", () => learningService.updateSettings(studyTime)),
    update: (item: LearningItem, patch: Partial<SaveLearningInput>) =>
      save(
        item.skillKey,
        {
          skillName: item.skillName,
          status: "LEARNING",
          steps: item.steps,
          days: item.days,
          ...patch,
        },
        patch.steps?.every(Boolean)
          ? `Hoàn thành ${item.skillName} — đã thêm vào hồ sơ.`
          : undefined,
      ),
  };
}
