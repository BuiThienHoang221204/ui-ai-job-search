import { api } from "@/lib/axios";
import type { ProfileRecord, QuickStartInput } from "@/types";

export const profileService = {
  get: () => api.get<ProfileRecord>("/profile").then((r) => r.data),

  update: (input: Partial<Omit<ProfileRecord, "id" | "userId" | "completion" | "createdAt" | "updatedAt">>) =>
    api.put<ProfileRecord>("/profile", input).then((r) => r.data),

  /** Bước "Chọn nhanh" lúc đăng ký - ghi tường minh, không qua suy luận như `update`. */
  quickStart: (input: QuickStartInput) =>
    api.post<ProfileRecord>("/profile/quick-start", input).then((r) => r.data),

  /** Thêm MỘT kỹ năng vào hồ sơ; đã có thì backend giữ nguyên. */
  addSkill: (skill: string) =>
    api.post<ProfileRecord>("/profile/skills", { skill }).then((r) => r.data),
};
