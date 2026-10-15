import { api } from "@/lib/axios";
import type {
  MockInterviewListQuery,
  MockInterviewRecord,
  MockInterviewSummary,
  Paginated,
} from "@/types";

export const mockInterviewService = {
  get: (id: string) =>
    api.get<MockInterviewRecord>(`/mock-interviews/${id}`).then((r) => r.data),

  list: (query?: MockInterviewListQuery) =>
    api
      .get<Paginated<MockInterviewSummary>>("/mock-interviews", { params: query })
      .then((r) => r.data),
};
