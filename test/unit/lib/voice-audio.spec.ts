import { describe, expect, it } from "vitest";
import { micFailureOf } from "@/lib/voice-audio";

describe("micFailureOf", () => {
  it("phân loại lỗi getUserMedia theo tên để báo đúng cách gỡ", () => {
    expect(micFailureOf(new DOMException("x", "NotAllowedError"))).toBe("blocked");
    expect(micFailureOf(new DOMException("x", "NotFoundError"))).toBe("missing");
    expect(micFailureOf(new DOMException("x", "NotReadableError"))).toBe("busy");
    expect(micFailureOf(new Error("worklet"))).toBe("other");
  });
});
