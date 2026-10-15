import { api } from "@/lib/axios";
import type {
  LearningItem,
  LearningOverview,
  SaveLearningInput,
} from "@/types";

const path = (key: string) => `/learning/${encodeURIComponent(key)}`;

export const learningService = {
  overview: () => api.get<LearningOverview>("/learning").then((r) => r.data),

  save: (key: string, input: SaveLearningInput) =>
    api.put<LearningItem>(path(key), input).then((r) => r.data),

  remove: (key: string) =>
    api.delete<{ removed: number }>(path(key)).then((r) => r.data),
};
