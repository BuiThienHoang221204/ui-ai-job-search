import { AxiosError, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, test, vi } from "vitest";

const get = vi.hoisted(() => vi.fn<() => Promise<unknown>>());
vi.mock("@/lib/axios", async (original) => ({
  ...(await original<typeof import("@/lib/axios")>()),
  api: { get, defaults: { baseURL: "" } },
}));

import { profileDraftService } from "@/services/profile-draft";

const httpError = (status: number) =>
  new AxiosError("lỗi", undefined, undefined, undefined, {
    status,
  } as AxiosResponse);

describe("profileDraftService.latestOrNull", () => {
  beforeEach(() => {
    get.mockReset();
  });

  test("chưa tải CV nào (404) thì là null, không phải lỗi", async () => {
    get.mockRejectedValue(httpError(404));
    await expect(profileDraftService.latestOrNull()).resolves.toBeNull();
  });

  test("lỗi khác vẫn ném ra để màn hình báo đúng", async () => {
    get.mockRejectedValue(httpError(500));
    await expect(profileDraftService.latestOrNull()).rejects.toBeInstanceOf(
      AxiosError,
    );
  });

  test("có CV thì trả nguyên bản ghi", async () => {
    get.mockResolvedValue({ data: { id: "draft-1" } });
    await expect(profileDraftService.latestOrNull()).resolves.toEqual({
      id: "draft-1",
    });
  });
});
