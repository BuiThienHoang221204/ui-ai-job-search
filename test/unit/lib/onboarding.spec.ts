import { describe, expect, it } from "vitest";
import type { DashboardOverview } from "@/types";
import { journeySteps } from "@/lib/onboarding";

function overview(over: Partial<DashboardOverview>): DashboardOverview {
  return {
    profileCompletion: 100,
    averageMatchScore: 70,
    totalScored: 5,
    journey: { cvs: 1, applied: 1, interviews: 1 },
    ...over,
  } as DashboardOverview;
}

describe("journeySteps", () => {
  it("chặng đang làm là chặng đầu tiên chưa xong, kèm việc nên làm", () => {
    const { steps, current } = journeySteps(overview({ journey: { cvs: 0, applied: 0, interviews: 0 } }));
    expect(current).toBe(2);
    expect(steps[current]).toMatchObject({ label: "Tối ưu CV", href: "/dashboard/cv-optimizer" });
  });

  it("xong cả năm chặng thì chặng đang làm vượt quá danh sách", () => {
    expect(journeySteps(overview({})).current).toBe(5);
  });

  it("hồ sơ dưới mốc sẵn sàng thì dừng ngay ở chặng đầu", () => {
    const { steps, current } = journeySteps(overview({ profileCompletion: 60, averageMatchScore: null }));
    expect(current).toBe(0);
    expect(steps[0].description).toBe("Hồ sơ 60%");
    expect(steps[1].description).toBe("5 tin đã chấm");
  });
});
