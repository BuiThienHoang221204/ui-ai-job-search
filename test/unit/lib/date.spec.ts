import { describe, expect, it } from "vitest";
import { formatClock } from "@/lib/date";

describe("formatClock", () => {
  it("hiện giờ và ngày theo giờ Việt Nam, kể cả khi giờ UTC còn ở ngày hôm trước", () => {
    expect(formatClock("2026-10-24T00:30:00.000Z")).toBe("07:30 24/10");
    expect(formatClock("2026-10-24T18:15:00.000Z")).toBe("01:15 25/10");
  });
});
