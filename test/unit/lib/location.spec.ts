import { describe, expect, test } from "vitest";
import { displayLocation, LOCATION_UNKNOWN } from "@/lib/location";

describe("displayLocation", () => {
  test("thiếu địa điểm thì nói rõ là không rõ, không trả chuỗi rỗng", () => {
    expect(displayLocation(null).text).toBe(LOCATION_UNKNOWN);
    expect(displayLocation(undefined).text).toBe(LOCATION_UNKNOWN);
    expect(displayLocation("   ").text).toBe(LOCATION_UNKNOWN);
  });

  test("địa điểm ngắn giữ nguyên và KHÔNG có title", () => {
    const place = displayLocation("Hà Nội");
    expect(place.text).toBe("Hà Nội");
    // `full` là undefined thì thẻ không có tooltip — quan trọng, vì tooltip lặp
    // lại đúng chữ đang hiện chỉ là tiếng ồn.
    expect(place.full).toBeUndefined();
  });

  test("địa chỉ dài giữ phần cuối (quận, tỉnh) và nguyên văn ở full", () => {
    const raw =
      "Century Tower, Phố Minh Khai, Khu đô thị Times City, Vĩnh Tuy, Hai Bà Trưng, Hà Nội, GIA BINH AIRPORT, Gia Binh, Bắc Ninh";
    const place = displayLocation(raw);

    expect(place.text).toBe("…Gia Binh, Bắc Ninh");
    expect(place.full).toBe(raw);
    expect(displayLocation("Phường An Khánh, TP. Hồ Chí Minh").text).toBe(
      "…TP. Hồ Chí Minh",
    );
  });

  test("không cắt giữa một chữ", () => {
    const place = displayLocation(
      "Tháp B, Khu thương mại dịch vụ kết hợp nhà ở cao tầng tại lô đất 1-13",
    );
    // Bỏ dấu … rồi so với nguyên văn: phần hiện phải là một đoạn của nguyên văn, kết thúc ở
    // ranh giới từ, chứ không phải "…dịch v…".
    const shown = place.text.slice(0, -1);
    expect(place.full?.includes(shown)).toBe(true);
    expect(shown.endsWith(" ")).toBe(false);
  });

  test("không để lại dấu phẩy lửng trước dấu ba chấm", () => {
    const place = displayLocation(
      "8th Floor, The Hallmark Office building, 15 Tran Bach Dang Street, Thu Duc City, Ho Chi Minh City",
    );
    expect(place.text).not.toContain(",…");
  });

  test("chuỗi dài liền mạch không có khoảng trắng vẫn bị cắt", () => {
    const raw = "A".repeat(200);
    const place = displayLocation(raw);
    expect(place.text.length).toBeLessThan(60);
    expect(place.full).toBe(raw);
  });
});
