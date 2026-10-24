import { describe, expect, it } from "vitest";
import { createVoiceGate, FRAME_SAMPLES, frameDb } from "@/lib/voice-gate";

const tone = (db: number) => {
  const amplitude = 10 ** (db / 20) * 32768 * Math.SQRT2;
  return Int16Array.from({ length: FRAME_SAMPLES }, (_, i) =>
    Math.round(amplitude * Math.sin(i / 3)),
  );
};

const isSilent = (frame: Int16Array) => frame.every((sample) => sample === 0);

describe("createVoiceGate", () => {
  it("tiếng nền nhỏ (tivi ở xa) không lọt qua: chỉ gửi im lặng", () => {
    const gate = createVoiceGate();
    const sent: Int16Array[] = [];
    for (let i = 0; i < 30; i++) sent.push(...gate(tone(-50), false).out);

    expect(sent.length).toBeGreaterThan(20);
    expect(sent.every(isSilent)).toBe(true);
  });

  it("giọng to hơn nền mở cổng và gửi cả các khung đầu câu đang chờ", () => {
    const gate = createVoiceGate();
    for (let i = 0; i < 20; i++) gate(tone(-50), false);

    gate(tone(-25), false);
    const opened = gate(tone(-25), false);

    expect(opened.open).toBe(true);
    expect(opened.out.some((frame) => !isSilent(frame))).toBe(true);
  });

  it("lúc AI đang nói cần giọng dài hơn mới tính là ngắt lời", () => {
    const gate = createVoiceGate();
    for (let i = 0; i < 20; i++) gate(tone(-50), true);

    const results = [1, 2, 3, 4].map(() => gate(tone(-20), true));

    expect(results.slice(0, 3).every((result) => !result.open)).toBe(true);
    expect(results[3].open).toBe(true);
  });

  it("frameDb đo đúng mức âm", () => {
    expect(Math.round(frameDb(tone(-30)))).toBe(-30);
  });
});
