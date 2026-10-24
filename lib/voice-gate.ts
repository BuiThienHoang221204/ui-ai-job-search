export const FRAME_SAMPLES = 1600;

const ABOVE_FLOOR_DB = 12;
const MIN_OPEN_DB = -42;
const BARGE_EXTRA_DB = 6;
const OPEN_FRAMES = 2;
const BARGE_FRAMES = 4;
const HANG_FRAMES = 10;

/** Âm lượng một khung PCM 16-bit, tính bằng dBFS. */
export function frameDb(frame: Int16Array): number {
  let sum = 0;
  for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i];
  const rms = Math.sqrt(sum / frame.length) / 32768;
  return rms > 0 ? 20 * Math.log10(rms) : -100;
}

interface GateResult {
  out: Int16Array[];
  db: number;
  open: boolean;
}

/** Cổng tạp âm: chỉ cho qua tiếng to hơn nền ít nhất 12 dB (ngắt lời AI cần to hơn nữa); khung bị chặn thay bằng im lặng. Số đo ở ADR 0019. */
export function createVoiceGate() {
  let floor = -60;
  let open = false;
  let loud = 0;
  let hang = 0;
  const queue: Int16Array[] = [];
  const silence = new Int16Array(FRAME_SAMPLES);

  return (frame: Int16Array, aiSpeaking: boolean): GateResult => {
    const db = frameDb(frame);
    const limit =
      Math.max(MIN_OPEN_DB, floor + ABOVE_FLOOR_DB) +
      (aiSpeaking ? BARGE_EXTRA_DB : 0);

    if (open) {
      hang = db >= limit - 6 ? HANG_FRAMES : hang - 1;
      if (hang <= 0) open = false;
      return { out: [open ? frame : silence], db, open };
    }

    if (db < floor) floor = 0.7 * floor + 0.3 * db;
    else if (db < limit) floor = 0.98 * floor + 0.02 * db;
    loud = db >= limit ? loud + 1 : 0;
    queue.push(frame);

    if (loud >= (aiSpeaking ? BARGE_FRAMES : OPEN_FRAMES)) {
      open = true;
      hang = HANG_FRAMES;
      loud = 0;
      return { out: queue.splice(0), db, open };
    }

    const out: Int16Array[] = [];
    while (queue.length > BARGE_FRAMES) {
      queue.shift();
      out.push(silence);
    }
    return { out, db, open };
  };
}
