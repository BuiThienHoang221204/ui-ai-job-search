import { describe, expect, it } from "vitest";
import { formatClock, postedWeeks } from "@/lib/date";

describe("formatClock", () => {
  it("hiện giờ và ngày theo giờ Việt Nam, kể cả khi giờ UTC còn ở ngày hôm trước", () => {
    expect(formatClock("2026-10-24T00:30:00.000Z")).toBe("07:30 24/10");
    expect(formatClock("2026-10-24T18:15:00.000Z")).toBe("01:15 25/10");
  });
});

describe("postedWeeks", () => {
  const now = new Date("2026-10-26T00:00:00Z");

  it("đánh dấu đúng tuần có lần đăng, tuần này ở cuối, bỏ lần đăng cũ hơn 13 tuần", () => {
    const weeks = postedWeeks(
      ["2026-10-25T00:00:00Z", "2026-10-05T00:00:00Z", "2026-05-01T00:00:00Z"],
      now,
    );

    expect(weeks).toHaveLength(13);
    expect(weeks[12]).toBe(true);
    expect(weeks[9]).toBe(true);
    expect(weeks.filter(Boolean)).toHaveLength(2);
  });
});
