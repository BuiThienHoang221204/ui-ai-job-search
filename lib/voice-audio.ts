import type { MicFailure } from "@/types";
import { FRAME_SAMPLES } from "./voice-gate";

const CAPTURE_WORKLET = `
class Capture extends AudioWorkletProcessor {
  constructor() { super(); this.buf = new Int16Array(${FRAME_SAMPLES}); this.n = 0; }
  process(inputs) {
    const ch = inputs[0][0];
    if (!ch) return true;
    for (let i = 0; i < ch.length; i++) {
      const s = Math.max(-1, Math.min(1, ch[i]));
      this.buf[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.n === this.buf.length) { this.port.postMessage(this.buf.slice().buffer); this.n = 0; }
    }
    return true;
  }
}
registerProcessor("capture", Capture);`;

/** Loại lỗi khi mở micro, theo tên lỗi của `getUserMedia`: bị chặn quyền, không có micro, micro đang bận. */
export function micFailureOf(cause: unknown): MicFailure {
  const name = cause instanceof DOMException ? cause.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "blocked";
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "missing";
  }
  if (name === "NotReadableError" || name === "AbortError") return "busy";
  return "other";
}

export const toBase64 = (frame: Int16Array): string => {
  const bytes = new Uint8Array(frame.buffer, frame.byteOffset, frame.byteLength);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

/** Âm thanh của buổi luyện giọng nói: thu micro 16 kHz thành khung 100 ms, phát giọng AI 24 kHz nối tiếp nhau. Gọi trong sự kiện bấm của người dùng để trình duyệt cho phát tiếng. */
export function createVoiceAudio() {
  const input = new AudioContext({ sampleRate: 16000 });
  const output = new AudioContext({ sampleRate: 24000 });
  void output.resume();
  let stream: MediaStream | null = null;
  let nextAt = 0;
  let sources: AudioBufferSourceNode[] = [];
  let idle: Array<() => void> = [];

  const settle = () => {
    if (sources.length > 0) return;
    idle.forEach((resolve) => resolve());
    idle = [];
  };

  return {
    async listen(onFrame: (frame: Int16Array) => void) {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      await input.resume();
      const url = URL.createObjectURL(
        new Blob([CAPTURE_WORKLET], { type: "application/javascript" }),
      );
      await input.audioWorklet.addModule(url);
      const node = new AudioWorkletNode(input, "capture");
      node.port.onmessage = (event: MessageEvent<ArrayBuffer>) =>
        onFrame(new Int16Array(event.data));
      input.createMediaStreamSource(stream).connect(node);
    },

    play(base64: string) {
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      const pcm = new Int16Array(bytes.buffer);
      const buffer = output.createBuffer(1, pcm.length, 24000);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < pcm.length; i++) channel[i] = pcm[i] / 32768;
      const source = output.createBufferSource();
      source.buffer = buffer;
      source.connect(output.destination);
      nextAt = Math.max(nextAt, output.currentTime);
      source.start(nextAt);
      nextAt += buffer.duration;
      sources.push(source);
      source.onended = () => {
        sources = sources.filter((item) => item !== source);
        settle();
      };
    },

    speaking: () => sources.length > 0,

    interrupt() {
      sources.forEach((source) => source.stop());
      sources = [];
      nextAt = 0;
      settle();
    },

    whenIdle: () =>
      new Promise<void>((resolve) => {
        idle.push(resolve);
        settle();
      }),

    close() {
      stream?.getTracks().forEach((track) => track.stop());
      void input.close();
      void output.close();
    },
  };
}
