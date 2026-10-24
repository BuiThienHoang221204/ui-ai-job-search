import { api } from "@/lib/axios";
import type {
  MockInterviewListQuery,
  MockInterviewRecord,
  MockInterviewSummary,
  Paginated,
  VoiceSession,
} from "@/types";

export const mockInterviewService = {
  get: (id: string) =>
    api.get<MockInterviewRecord>(`/mock-interviews/${id}`).then((r) => r.data),

  list: (query?: MockInterviewListQuery) =>
    api
      .get<Paginated<MockInterviewSummary>>("/mock-interviews", { params: query })
      .then((r) => r.data),

  openVoice: (jobId: string) =>
    api
      .post<VoiceSession>("/mock-interviews/voice", { jobId })
      .then((r) => r.data),

  saveVoiceTurn: (runId: string, turn: { question: string; answer: string }) =>
    api
      .post<{ answered: number }>(`/mock-interviews/${runId}/voice-turns`, turn)
      .then((r) => r.data),
};
