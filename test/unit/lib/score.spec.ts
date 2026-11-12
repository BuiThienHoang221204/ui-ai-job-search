import { describe, expect, it } from "vitest";
import { skillFitLabel } from "@/lib/score";

describe("skillFitLabel", () => {
  it("ghi số kỹ năng khớp trên tổng số yêu cầu", () => {
    expect(skillFitLabel({ met: 3, total: 5 })).toBe("Khớp kỹ năng 3/5");
  });

  it("không hiện gì khi tin chưa có yêu cầu kỹ năng", () => {
    expect(skillFitLabel(null)).toBeNull();
    expect(skillFitLabel({ met: 0, total: 0 })).toBeNull();
  });
});
