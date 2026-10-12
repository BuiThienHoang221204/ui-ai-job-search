import { AxiosError, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { fetchLatestCv } from "@/hooks/use-latest-cv";

const latest = vi.hoisted(() => vi.fn<() => Promise<unknown>>());
vi.mock("@/services", () => ({ profileDraftService: { latest } }));

const httpError = (status: number) =>
  new AxiosError("lỗi", undefined, undefined, undefined, {
    status,
  } as AxiosResponse);

describe("fetchLatestCv", () => {
  beforeEach(() => {
    latest.mockReset();
  });

  test("chưa tải CV nào (404) thì là null, không phải lỗi", async () => {
    latest.mockRejectedValue(httpError(404));
    await expect(fetchLatestCv()).resolves.toBeNull();
  });

  test("lỗi khác vẫn ném ra để màn hình báo đúng", async () => {
    latest.mockRejectedValue(httpError(500));
    await expect(fetchLatestCv()).rejects.toBeInstanceOf(AxiosError);
  });

  test("có CV thì trả nguyên bản ghi", async () => {
    latest.mockResolvedValue({ id: "draft-1" });
    await expect(fetchLatestCv()).resolves.toEqual({ id: "draft-1" });
  });
});
