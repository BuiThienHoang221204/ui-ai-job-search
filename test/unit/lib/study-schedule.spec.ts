import { describe, expect, test } from "vitest";
import { STUDY_TIMES, remindTime } from "@/lib/study-schedule";
import { vapidKeyBytes } from "@/lib/push";

describe("STUDY_TIMES", () => {
  test("từ 06:00 tới 23:00, bước 30 phút, khớp danh sách backend nhận", () => {
    expect(STUDY_TIMES[0]).toBe("06:00");
    expect(STUDY_TIMES[1]).toBe("06:30");
    expect(STUDY_TIMES.at(-1)).toBe("23:00");
    expect(STUDY_TIMES).toHaveLength(35);
  });
});

describe("remindTime", () => {
  test("nhắc trước giờ học 15 phút, kể cả khi lùi qua giờ chẵn", () => {
    expect(remindTime("21:00")).toBe("20:45");
    expect(remindTime("06:30")).toBe("06:15");
  });
});

describe("vapidKeyBytes", () => {
  test("giải base64url có ký tự - và _ và thiếu dấu =", () => {
    expect(Array.from(vapidKeyBytes("-_8"))).toEqual([251, 255]);
  });
});
