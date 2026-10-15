import { describe, expect, test } from "vitest";
import type { PublicJobDetail } from "@/types";
import { metadataForJob } from "@/lib/job-metadata";

const job: PublicJobDetail = {
  id: "job-1",
  source: "topcv",
  url: "https://example.test/tin-1",
  title: "Kế toán tổng hợp",
  company: "Công ty A",
  companyLogo: null,
  location: "Hà Nội",
  workMode: null,
  tags: [],
  postedAt: null,
  scrapedAt: "2026-10-01T00:00:00.000Z",
  provinceCode: "HN",
  occupationCode: "FINANCE",
  description: "Lập báo cáo thuế.",
  systemMatch: null,
};

describe("metadataForJob", () => {
  test("tiêu đề chia sẻ gồm chức danh và công ty, mô tả có nơi làm", () => {
    const metadata = metadataForJob(job);

    expect(metadata.openGraph?.title).toBe("Kế toán tổng hợp — Công ty A");
    expect(metadata.description).toBe(
      "Công ty A tuyển Kế toán tổng hợp tại Hà Nội.",
    );
  });

  test("không có nơi làm thì bỏ vế đó, và luôn noindex", () => {
    const metadata = metadataForJob({ ...job, location: null });

    expect(metadata.description).toBe("Công ty A tuyển Kế toán tổng hợp.");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
