import { describe, expect, test } from "vitest";
import {
  buildReview,
  defaultChoices,
  isReviewEmpty,
  reviewValues,
} from "@/lib/profile-draft-content";
import type { ProfileProposal, ProfileRecord } from "@/services";

const emptyProposal = (): ProfileProposal => ({
  languages: [],
  primarySkills: [],
  secondarySkills: [],
  directExperienceDomains: [],
  adjacentExperience: [],
  experiences: [],
  educations: [],
  certificates: [],
  projects: [],
  missing: [],
  notes: [],
});

const proposal = (
  overrides: Partial<ProfileProposal> = {},
): ProfileProposal => ({
  ...emptyProposal(),
  headline: "Kỹ sư Backend 5 năm kinh nghiệm",
  primarySkills: ["TypeScript", "NestJS"],
  experiences: [
    {
      company: "Digistore",
      position: "Senior Backend Engineer",
      period: "03/2022 – nay",
      highlights: [],
    },
  ],
  ...overrides,
});

const profile = (overrides: Partial<ProfileRecord> = {}) =>
  ({
    headline: null,
    location: null,
    country: null,
    summary: null,
    languages: [],
    primarySkills: [],
    secondarySkills: [],
    directExperienceDomains: [],
    adjacentExperience: [],
    experiences: null,
    projects: null,
    educations: null,
    certificates: null,
    ...overrides,
  }) as unknown as ProfileRecord;

describe("buildReview", () => {
  test("hồ sơ trống: mọi thứ CV có đều là phần thêm mới", () => {
    const review = buildReview(proposal(), profile());
    expect(review.texts).toEqual([
      {
        field: "headline",
        current: "",
        proposed: "Kỹ sư Backend 5 năm kinh nghiệm",
      },
    ]);
    expect(review.lists).toEqual([
      { field: "primarySkills", current: [], added: ["TypeScript", "NestJS"] },
    ]);
    expect(review.items[0].added).toHaveLength(1);
  });

  test("kỹ năng đã có (khác hoa thường) không bị thêm lại", () => {
    const review = buildReview(
      proposal(),
      profile({ primarySkills: ["typescript", "Docker"] }),
    );
    expect(review.lists[0]).toEqual({
      field: "primarySkills",
      current: ["typescript", "Docker"],
      added: ["NestJS"],
    });
  });

  test("kỹ năng đã có ở nhóm khác cũng không bị thêm lại", () => {
    const review = buildReview(
      proposal({ primarySkills: ["Redis", "NestJS"] }),
      profile({ secondarySkills: ["redis"] }),
    );
    expect(review.lists[0].added).toEqual(["NestJS"]);
  });

  test("kinh nghiệm cùng công ty + chức danh không bị thêm trùng", () => {
    const review = buildReview(
      proposal(),
      profile({
        experiences: [
          { company: "digistore", position: "Senior Backend Engineer" },
        ],
      }),
    );
    expect(review.items).toEqual([]);
  });

  test("chữ giống hồ sơ thì không hỏi", () => {
    const review = buildReview(
      proposal(),
      profile({ headline: "Kỹ sư Backend 5 năm kinh nghiệm" }),
    );
    expect(review.texts).toEqual([]);
  });

  test("CV không có gì mới thì review rỗng", () => {
    expect(isReviewEmpty(buildReview(emptyProposal(), profile()))).toBe(true);
  });
});

describe("reviewValues", () => {
  test("mặc định: trường trống lấy từ CV, trường đã có giữ nguyên, danh sách được gộp", () => {
    const review = buildReview(
      proposal({ location: "Hà Nội" }),
      profile({ location: "Hồ Chí Minh", primarySkills: ["Docker"] }),
    );
    const values = reviewValues(review, defaultChoices(review));

    expect(values.headline).toBe("Kỹ sư Backend 5 năm kinh nghiệm");
    expect(values).not.toHaveProperty("location");
    expect(values.primarySkills).toEqual(["Docker", "TypeScript", "NestJS"]);
  });

  test("bỏ kỹ năng và bỏ hết mục mới thì không gửi trường đó", () => {
    const review = buildReview(proposal(), profile());
    const values = reviewValues(review, {
      ...defaultChoices(review),
      dropped: { primarySkills: ["TypeScript", "NestJS"] },
      added: { experiences: [] },
    });

    expect(values).not.toHaveProperty("primarySkills");
    expect(values).not.toHaveProperty("experiences");
  });

  test("mục mới đứng trước mục đang có", () => {
    const review = buildReview(
      proposal(),
      profile({ experiences: [{ company: "ABC", position: "Dev" }] }),
    );
    const values = reviewValues(review, defaultChoices(review));
    expect(
      (values.experiences as { company: string }[]).map((item) => item.company),
    ).toEqual(["Digistore", "ABC"]);
  });
});
