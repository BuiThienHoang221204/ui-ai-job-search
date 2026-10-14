import { describe, expect, test } from "vitest";
import { firstSession, googleCalendarUrl, icsContent } from "@/lib/learning-calendar";

const MONDAY_9AM_VN = new Date("2026-10-12T02:00:00Z");

describe("firstSession", () => {
  test("lấy ngày gần nhất trong các ngày đã chọn, 20:00 giờ Việt Nam (13:00 UTC)", () => {
    expect(firstSession(["TH", "TU"], MONDAY_9AM_VN).toISOString()).toBe(
      "2026-10-13T13:00:00.000Z",
    );
  });

  /// 23:00 thứ Hai giờ VN vẫn là 16:00 thứ Hai UTC — phải tính theo giờ Việt Nam, không theo giờ máy.
  test("tính thứ trong tuần theo giờ Việt Nam", () => {
    const sundayLateUtc = new Date("2026-10-11T18:00:00Z");
    expect(firstSession(["MO"], sundayLateUtc).toISOString()).toBe(
      "2026-10-12T13:00:00.000Z",
    );
  });
});

describe("googleCalendarUrl", () => {
  test("mang tên buổi học, giờ bắt đầu/kết thúc và luật lặp theo đúng thứ tự ngày", () => {
    const url = new URL(googleCalendarUrl("Docker", ["TH", "TU"], MONDAY_9AM_VN));

    expect(url.hostname).toBe("calendar.google.com");
    expect(url.searchParams.get("text")).toBe("Học Docker");
    expect(url.searchParams.get("dates")).toBe("20261013T130000Z/20261013T140000Z");
    expect(url.searchParams.get("recur")).toBe("RRULE:FREQ=WEEKLY;BYDAY=TU,TH");
  });
});

describe("icsContent", () => {
  test("là một VEVENT lặp hằng tuần, xuống dòng CRLF", () => {
    const ics = icsContent("C#, .NET", ["SA"], MONDAY_9AM_VN);

    expect(ics).toContain("\r\nRRULE:FREQ=WEEKLY;BYDAY=SA\r\n");
    expect(ics).toContain("DTSTART:20261017T130000Z");
    expect(ics).toContain("SUMMARY:Học C#\\, .NET");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
  });
});
