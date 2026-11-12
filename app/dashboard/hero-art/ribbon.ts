type Pt = [number, number];
type Cubic = [Pt, Pt, Pt, Pt];
type Rgb = [number, number, number];
type Sample = { x: number; y: number; nx: number; ny: number };
type Strip = { pts: Sample[]; keys: [number, number][]; phase: number };
type Edge = { ax: number; ay: number; bx: number; by: number; c: number; s: number; t: number };

export const STAGE_W = 1536;
const STAGE_H = 1024;

const PATH_TOP: Cubic[] = [
  [[640, 470], [420, 500], [300, 420], [330, 320]],
  [[330, 320], [370, 190], [520, 70], [690, 66]],
  [[690, 66], [830, 62], [930, 140], [945, 250]],
];
const PATH_BOTTOM: Cubic[] = [
  [[560, 640], [360, 610], [170, 680], [168, 790]],
  [[168, 790], [166, 900], [420, 925], [660, 905]],
  [[660, 905], [900, 885], [1150, 905], [1250, 770]],
  [[1250, 770], [1320, 660], [1240, 500], [1100, 452]],
  [[1100, 452], [1010, 425], [930, 440], [880, 470]],
];
const TWIST_TOP: [number, number][] = [[0, 10], [0.2, 45], [0.4, 10], [0.65, -15], [0.85, 20], [1, 30]];
const TWIST_BOTTOM: [number, number][] = [[0, 20], [0.15, 10], [0.32, 55], [0.42, 120], [0.55, 170], [0.75, 185], [0.9, 200], [1, 190]];

const FRONT: [Rgb, Rgb] = [[47, 45, 193], [186, 205, 255]];
const BACK: [Rgb, Rgb] = [[23, 24, 108], [102, 124, 255]];
const SHADOW_COLOR = "#2f2dc1";
const WIDTH = 100;
const TWIST_WOBBLE = 0.25;
const TWIST_SPEED = 0.5;
const SEG = 360;

export type RibbonState = { draw: number; sheen: number; sheenA: number; wobble: number; time: number };

function cubicAt([p0, p1, p2, p3]: Cubic, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

/** Lấy SEG+1 điểm cách đều theo chiều dài đường cong, kèm pháp tuyến tại mỗi điểm. */
function sample(path: Cubic[]): Sample[] {
  const dense: Pt[] = [];
  path.forEach((seg, index) => {
    for (let i = index === 0 ? 0 : 1; i <= 200; i++) dense.push(cubicAt(seg, i / 200));
  });
  const cum = [0];
  for (let i = 1; i < dense.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  }
  const total = cum[cum.length - 1];
  const pts: Pt[] = [];
  let j = 1;
  for (let i = 0; i <= SEG; i++) {
    const target = (total * i) / SEG;
    while (j < cum.length - 1 && cum[j] < target) j++;
    const span = cum[j] - cum[j - 1] || 1;
    const k = Math.min(1, Math.max(0, (target - cum[j - 1]) / span));
    pts.push([dense[j - 1][0] + (dense[j][0] - dense[j - 1][0]) * k, dense[j - 1][1] + (dense[j][1] - dense[j - 1][1]) * k]);
  }
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(SEG, i + 1)];
    const m = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return { x: p[0], y: p[1], nx: -(b[1] - a[1]) / m, ny: (b[0] - a[0]) / m };
  });
}

function twistAt(keys: [number, number][], t: number): number {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, a0] = keys[i - 1];
      const [t1, a1] = keys[i];
      const k = (t - t0) / (t1 - t0);
      const s = k * k * (3 - 2 * k);
      return ((a0 + (a1 - a0) * s) * Math.PI) / 180;
    }
  }
  return (keys[keys.length - 1][1] * Math.PI) / 180;
}

const mix = (a: Rgb, b: Rgb, k: number): Rgb => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

let strips: Strip[] | null = null;
const getStrips = () =>
  (strips ??= [
    { pts: sample(PATH_TOP), keys: TWIST_TOP, phase: 0 },
    { pts: sample(PATH_BOTTOM), keys: TWIST_BOTTOM, phase: 2.1 },
  ]);

function quad(context: CanvasRenderingContext2D, e0: Edge, e1: Edge) {
  context.beginPath();
  context.moveTo(e0.ax, e0.ay);
  context.lineTo(e1.ax, e1.ay);
  context.lineTo(e1.bx, e1.by);
  context.lineTo(e0.bx, e0.by);
  context.closePath();
}

/** Dải ruy băng dẹt có xoắn vẽ trên canvas: mỗi lát xoay quanh đường tâm, bề rộng hiện = W·|cos θ|, cos θ < 0 là mặt sau. */
export function createRibbon(canvas: HTMLCanvasElement, shadow: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  const sctx = shadow.getContext("2d");
  if (!ctx || !sctx) return null;

  shadow.width = STAGE_W / 2;
  shadow.height = STAGE_H / 2;
  sctx.setTransform(0.5, 0, 0, 0.5, 0, 0);

  function setResolution(res: number) {
    const r = Math.max(1, Math.min(2, res));
    const w = Math.round(STAGE_W * r);
    if (canvas.width !== w) {
      canvas.width = w;
      canvas.height = Math.round(STAGE_H * r);
    }
    ctx!.setTransform(r, 0, 0, r, 0, 0);
  }

  function render(st: RibbonState) {
    ctx!.clearRect(0, 0, STAGE_W, STAGE_H);
    sctx!.clearRect(0, 0, STAGE_W, STAGE_H);

    for (const strip of getStrips()) {
      const n = Math.floor(SEG * st.draw);
      if (n < 1) continue;

      const edges: Edge[] = [];
      for (let i = 0; i <= n; i++) {
        const t = i / SEG;
        const p = strip.pts[i];
        const th = twistAt(strip.keys, t) + st.wobble * TWIST_WOBBLE * Math.sin(st.time * TWIST_SPEED * 2 + t * 7 + strip.phase);
        const c = Math.cos(th);
        const hw = (WIDTH / 2) * Math.max(0.06, Math.abs(c));
        edges.push({ ax: p.x + p.nx * hw, ay: p.y + p.ny * hw, bx: p.x - p.nx * hw, by: p.y - p.ny * hw, c, s: Math.sin(th), t });
      }

      for (let i = 0; i < n; i++) {
        const e0 = edges[i];
        const front = e0.c >= 0;
        const d = (e0.t - st.sheen) / 0.05;
        let light = 0.2 + 0.5 * Math.abs(e0.c) + 0.18 * e0.s * (front ? 1 : -1) + 0.15 * Math.sin(e0.t * 9 + strip.phase);
        light = Math.min(1.15, Math.max(0, light + st.sheenA * 0.75 * Math.exp(-d * d)));
        const [dark, bright] = front ? FRONT : BACK;
        let col = mix(dark, bright, Math.min(1, light));
        if (light > 1) col = mix(col, [255, 255, 255], (light - 1) * 3);
        const fill = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;

        quad(ctx!, e0, edges[i + 1]);
        ctx!.fillStyle = fill;
        ctx!.strokeStyle = fill;
        ctx!.lineWidth = 1;
        ctx!.fill();
        ctx!.stroke();

        quad(sctx!, e0, edges[i + 1]);
        sctx!.fillStyle = SHADOW_COLOR;
        sctx!.fill();
      }

      for (const side of ["a", "b"] as const) {
        ctx!.beginPath();
        edges.forEach((e, i) => {
          const x = side === "a" ? e.ax : e.bx;
          const y = side === "a" ? e.ay : e.by;
          if (i) ctx!.lineTo(x, y);
          else ctx!.moveTo(x, y);
        });
        ctx!.strokeStyle = side === "a" ? "rgba(255,255,255,.55)" : "rgba(23,24,108,.35)";
        ctx!.lineWidth = 1.6;
        ctx!.stroke();
      }
    }
  }

  return { setResolution, render };
}

export type Ribbon = NonNullable<ReturnType<typeof createRibbon>>;
